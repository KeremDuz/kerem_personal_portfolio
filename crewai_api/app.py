"""CrewAI + LangGraph + FastAPI mikroservisi.

Bu dosya:
- YAML üzerinden ajan ve görev konfigürasyonlarını okur.
- CrewAI ajanlarını ve görevlerini oluşturur.
- LangGraph iş akışını yükler.
- FastAPI üzerinden `/ask` (CrewAI) ve `/ask-langgraph` endpoint'lerini sağlar.
"""

from pathlib import Path
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
import html
import json
import os
import re
from typing import Any
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from zoneinfo import ZoneInfo

from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

import uvicorn
import yaml
from crewai import Agent, Crew, Process, Task
from crewai.tools import BaseTool
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from langchain_community.tools import DuckDuckGoSearchRun
from pydantic import BaseModel


BASE_DIR = Path(__file__).resolve().parent
CONFIG_DIR = BASE_DIR / "config"
AGENTS_FILE = CONFIG_DIR / "agents.yaml"
TASKS_FILE = CONFIG_DIR / "tasks.yaml"


def load_yaml(file_path: Path) -> dict[str, Any]:
	"""YAML dosyasını okuyup sözlük olarak döndürür."""
	if not file_path.exists():
		raise FileNotFoundError(f"Config dosyası bulunamadı: {file_path}")

	with file_path.open("r", encoding="utf-8") as file:
		data = yaml.safe_load(file) or {}

	if not isinstance(data, dict):
		raise ValueError(f"Beklenen YAML formatı sözlük olmalı: {file_path}")

	return data


agents_config = load_yaml(AGENTS_FILE)
tasks_config = load_yaml(TASKS_FILE)


app = FastAPI(title="CrewAI Agentic API", version="1.0.0")

app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)


class AskRequest(BaseModel):
	"""`/ask` endpoint'inin beklediği request modeli."""

	question: str


def send_breach_alert(alert: str) -> str:
	"""Breach uyarısını webhook'a gönderir."""

	webhook_url = os.getenv("BREACH_ALERT_WEBHOOK_URL", "").strip()
	if not webhook_url:
		return "Bildirim gönderilmedi: BREACH_ALERT_WEBHOOK_URL tanımlı değil."

	webhook_format = os.getenv("BREACH_ALERT_WEBHOOK_FORMAT", "").strip().lower()
	parsed_url = urllib.parse.urlparse(webhook_url)

	if webhook_format == "ntfy" or parsed_url.netloc.endswith("ntfy.sh"):
		payload = alert.encode("utf-8")
		headers = {
			"Content-Type": "text/plain; charset=utf-8",
			"Title": "Breach Intel Alert",
		}
	else:
		payload = json.dumps(
			{
				"text": alert,
				"content": alert,
				"source": "kerem-portfolio-breach-agent",
			},
			ensure_ascii=False,
		).encode("utf-8")
		headers = {"Content-Type": "application/json"}

	request = urllib.request.Request(
		webhook_url,
		data=payload,
		headers=headers,
		method="POST",
	)

	try:
		with urllib.request.urlopen(request, timeout=8) as response:
			return f"Bildirim gönderildi. HTTP {response.status}"
	except urllib.error.URLError as error:
		return f"Bildirim gönderilemedi: {error}"


class DuckDuckGoCrewTool(BaseTool):
	"""CrewAI ile uyumlu DuckDuckGo arama aracı."""

	name: str = "duckduckgo_search"
	description: str = "DuckDuckGo üzerinde web araması yapar ve metin sonuçlarını döndürür."

	def _run(self, query: str) -> str:
		search_tool = DuckDuckGoSearchRun()
		return str(search_tool.invoke(query))


class CurrentBreachNewsTool(BaseTool):
	"""Son şirket ihlallerini tarih baskılı sorgularla arayan CrewAI aracı."""

	name: str = "current_breach_news_search"
	description: str = (
		"En son/güncel hacklenen şirket, veri ihlali veya ransomware olayı sorularında kullanılır. "
		"Tek parametre olarak ziyaretçinin sorusunu veya şirket adını alır; güncel yıl ve son günler "
		"odaklı birden fazla arama yapıp sonuçları döndürür."
	)

	def _clean_text(self, value: str) -> str:
		"""RSS açıklamalarındaki HTML kırıntılarını sade metne çevirir."""

		text = html.unescape(value or "")
		text = re.sub(r"<[^>]+>", " ", text)
		return re.sub(r"\s+", " ", text).strip()

	def _parse_feed_items(self, source: str, feed_url: str, current_year: str) -> list[dict[str, Any]]:
		"""RSS feed'inden güncel ihlal/saldırı haberlerini çeker."""

		relevance_terms = [
			"breach",
			"breached",
			"data theft",
			"data stolen",
			"stolen data",
			"stolen",
			"leak",
			"leaked",
			"hack",
			"hacked",
			"hacker",
			"hackers",
			"compromise",
			"compromised",
			"compromises",
			"ransomware",
			"supply-chain attack",
			"supply chain attack",
			"trojanized",
			"intrusion",
			"phishing",
		]
		non_incident_terms = [
			"webinar",
			"could",
			"can be",
			"zero-day",
			"vulnerability",
			"vulnerabilities",
			"patch",
			"patches",
			"fixes",
			"flaw",
			"bug",
			"funding",
			"raises",
		]
		score_terms = [
			("breach", 10),
			("breached", 10),
			("data theft", 9),
			("data stolen", 9),
			("stolen data", 9),
			("supply-chain attack", 8),
			("supply chain attack", 8),
			("trojanized", 8),
			("compromise", 7),
			("compromised", 7),
			("ransomware", 7),
			("hackers compromise", 7),
			("hacked", 6),
			("phishing", 5),
			("leak", 5),
			("leaked", 5),
			("intrusion", 4),
			("hackers", 3),
		]

		request = urllib.request.Request(
			feed_url,
			headers={"User-Agent": "kerem-portfolio-breach-agent/1.0"},
		)
		with urllib.request.urlopen(request, timeout=8) as response:
			feed_xml = response.read()

		root = ET.fromstring(feed_xml)
		items: list[dict[str, Any]] = []

		for item in root.findall(".//item"):
			title = self._clean_text(item.findtext("title", ""))
			link = self._clean_text(item.findtext("link", ""))
			description = self._clean_text(item.findtext("description", ""))
			published = self._clean_text(item.findtext("pubDate", ""))
			title_text = title.lower()
			search_text = f"{title} {description}".lower()

			if not any(term in search_text for term in relevance_terms):
				continue
			if any(term in title_text for term in non_incident_terms):
				continue
			if current_year not in published and current_year not in search_text:
				continue

			incident_score = sum(score for term, score in score_terms if term in search_text)
			if incident_score <= 0:
				continue

			try:
				published_dt = parsedate_to_datetime(published)
			except (TypeError, ValueError):
				published_dt = datetime.min.replace(tzinfo=timezone.utc)
			if published_dt.tzinfo is None:
				published_dt = published_dt.replace(tzinfo=timezone.utc)

			items.append(
				{
					"source": source,
					"title": title,
					"link": link,
					"description": description,
					"published": published,
					"published_dt": published_dt,
					"incident_score": incident_score,
				}
			)

		return items

	def _current_feed_results(self, current_year: str) -> str:
		"""Güvenilir RSS kaynaklarından tarih sıralı güncel haber özeti üretir."""

		feed_urls = {
			"BleepingComputer": "https://www.bleepingcomputer.com/feed/",
			"The Record": "https://therecord.media/feed",
			"SecurityWeek": "https://www.securityweek.com/feed/",
			"Cybersecurity Dive": "https://www.cybersecuritydive.com/feeds/news/",
		}
		items: list[dict[str, Any]] = []
		errors: list[str] = []

		for source, feed_url in feed_urls.items():
			try:
				items.extend(self._parse_feed_items(source, feed_url, current_year))
			except Exception as error:
				errors.append(f"{source}: {error}")

		items.sort(key=lambda row: (row["incident_score"], row["published_dt"]), reverse=True)
		if not items:
			error_text = f" Feed errors: {' | '.join(errors)}" if errors else ""
			return (
				"RSS CURRENT NEWS: Güncel yıl için feed kaynaklarında ilgili ihlal/hack "
				f"haberi bulunamadı.{error_text}"
			)

		lines = ["RSS CURRENT NEWS (relevance-ranked current-year items; prefer these over generic search snippets):"]
		for item in items[:10]:
			lines.extend(
				[
					f"- Source: {item['source']}",
					f"  Published: {item['published']}",
					f"  Title: {item['title']}",
					f"  Link: {item['link']}",
					f"  Summary: {item['description'][:400]}",
				]
			)

		if errors:
			lines.append(f"Feed errors: {' | '.join(errors)}")

		return "\n".join(lines)

	def _run(self, topic: str) -> str:
		search_tool = DuckDuckGoSearchRun()
		today_context = get_today_context()
		current_year = today_context["today_iso"][:4]
		topic_text = topic.strip() or "latest hacked company"
		queries = [
			f"{topic_text} latest data breach hacked company {current_year}",
			f"latest company data breach ransomware cyber attack {current_year}",
			f"latest breached company cyberattack {current_year} security news",
			f"site:bleepingcomputer.com latest data breach company {current_year}",
			f"site:therecord.media latest data breach company {current_year}",
			f"site:securityweek.com latest data breach ransomware company {current_year}",
		]
		results: list[str] = [
			f"Today/context date: {today_context['today_iso']} ({today_context['today_text']}, {today_context['weekday_tr']})",
			"Use only current-year/recent results as latest. Do not present older incidents as latest unless no newer source is found.",
			self._current_feed_results(current_year),
		]

		if "Güncel yıl için feed kaynaklarında ilgili" in results[-1]:
			search_queries = queries
		else:
			search_queries = queries[:2]

		for query in search_queries:
			try:
				search_result = search_tool.invoke(query)
			except Exception as error:
				search_result = f"Search failed: {error}"
			results.append(f"QUERY: {query}\nRESULTS:\n{search_result}")

		return "\n\n".join(results)


class BreachAlertNotificationTool(BaseTool):
	"""Ciddi ihlal özetlerini opsiyonel webhook'a bildiren CrewAI aracı."""

	name: str = "send_breach_alert"
	description: str = (
		"Ciddi şirket ihlali veya veri sızıntısı özeti için bildirim gönderir. "
		"Tek parametre olarak kısa ve net bir uyarı metni alır. "
		"BREACH_ALERT_WEBHOOK_URL tanımlı değilse bildirim göndermez."
	)

	def _run(self, alert: str) -> str:
		return send_breach_alert(alert)


def get_today_context() -> dict[str, str]:
	"""Türkiye saatine göre bugünün tarih bilgisini üretir."""

	now_tr = datetime.now(ZoneInfo("Europe/Istanbul"))
	weekday_map = {
		0: "Pazartesi",
		1: "Salı",
		2: "Çarşamba",
		3: "Perşembe",
		4: "Cuma",
		5: "Cumartesi",
		6: "Pazar",
	}
	month_map = {
		1: "Ocak",
		2: "Şubat",
		3: "Mart",
		4: "Nisan",
		5: "Mayıs",
		6: "Haziran",
		7: "Temmuz",
		8: "Ağustos",
		9: "Eylül",
		10: "Ekim",
		11: "Kasım",
		12: "Aralık",
	}

	weekday_tr = weekday_map[now_tr.weekday()]
	today_text = f"{now_tr.day} {month_map[now_tr.month]} {now_tr.year}"

	return {
		"today_iso": now_tr.strftime("%Y-%m-%d"),
		"today_text": today_text,
		"weekday_tr": weekday_tr,
	}


def is_date_or_day_question(question: str) -> bool:
	"""Sorunun gün/tarih istemi içerip içermediğini tespit eder."""

	text = question.lower()
	patterns = [
		"bugün günlerden ne",
		"bugün hangi gün",
		"bugün ne günü",
		"bugün tarih",
		"bugünün tarihi",
		"tarih ne",
		"bugün ayın kaçı",
	]
	return any(pattern in text for pattern in patterns)


def is_contact_question(question: str) -> bool:
	"""Sorunun iletişim bilgisi (telefon/mail) isteyip istemediğini tespit eder."""

	text = question.lower()
	patterns = [
		"telefon",
		"numara",
		"gsm",
		"mail",
		"e-posta",
		"eposta",
		"iletişim",
		"iletisim",
		"contact",
	]
	return any(pattern in text for pattern in patterns)


def get_contact_response() -> str:
	"""İletişim bilgilerini tek formatta döndürür."""

	phone = os.getenv("KEREM_PHONE", "0505 991 37 75")
	email = os.getenv("KEREM_EMAIL", "keremduz0304@gmail.com")
	return (
		"Kerem Düz iletişim bilgileri:\n"
		f"Telefon: {phone}\n"
		f"E-posta: {email}"
	)


def has_openai_key() -> bool:
	"""OpenAI anahtarının ortamda tanımlı olup olmadığını kontrol eder."""

	return bool(os.getenv("OPENAI_API_KEY", "").strip())


def run_crewai_pipeline(
	question: str,
	today_context: dict[str, str],
	execution_route: str = "crew_full_analysis",
) -> str:
	"""CrewAI uzman ajan zincirini çalıştırıp nihai cevabı döndürür."""

	if not has_openai_key():
		raise HTTPException(
			status_code=503,
			detail="OPENAI_API_KEY bulunamadı. Anahtarı ortam değişkeni olarak tanımlayıp API'yi yeniden başlatın.",
		)

	try:
		crew = build_crew(execution_route)
		result = crew.kickoff(
			inputs={
				"visitor_question": question,
				"today_iso": today_context["today_iso"],
				"today_text": today_context["today_text"],
				"weekday_tr": today_context["weekday_tr"],
			}
		)
		return str(result)
	except Exception as error:
		raise HTTPException(status_code=500, detail=f"Crew çalıştırılamadı: {error}") from error


def build_crew(execution_route: str = "crew_full_analysis") -> Crew:
	"""Ajanları ve görevleri oluşturup Crew nesnesini döndürür."""

	# Araç tanımları
	ddg_tool = DuckDuckGoCrewTool()
	current_breach_news_tool = CurrentBreachNewsTool()
	alert_tool = BreachAlertNotificationTool()

	# Ajanlar
	cv_researcher = Agent(
		role=agents_config["cv_researcher"]["role"],
		goal=agents_config["cv_researcher"]["goal"],
		backstory=agents_config["cv_researcher"]["backstory"],
		verbose=True,
	)

	cti_expert = Agent(
		role=agents_config["cti_expert"]["role"],
		goal=agents_config["cti_expert"]["goal"],
		backstory=agents_config["cti_expert"]["backstory"],
		tools=[ddg_tool],
		verbose=True,
	)

	breach_intel_expert = Agent(
		role=agents_config["breach_intel_expert"]["role"],
		goal=agents_config["breach_intel_expert"]["goal"],
		backstory=agents_config["breach_intel_expert"]["backstory"],
		tools=[current_breach_news_tool, ddg_tool, alert_tool],
		verbose=True,
	)

	spokesperson = Agent(
		role=agents_config["spokesperson"]["role"],
		goal=agents_config["spokesperson"]["goal"],
		backstory=agents_config["spokesperson"]["backstory"],
		verbose=True,
	)

	# Görevler
	profile_task = Task(
		description=tasks_config["profile_task"]["description"],
		expected_output=tasks_config["profile_task"]["expected_output"],
		agent=cv_researcher,
	)

	agents = [cv_researcher]
	tasks = [profile_task]
	answer_context = [profile_task]

	if execution_route in {"crew_cve_analysis", "crew_full_analysis"}:
		cve_search_task = Task(
			description=tasks_config["cve_search_task"]["description"],
			expected_output=tasks_config["cve_search_task"]["expected_output"],
			agent=cti_expert,
		)
		agents.append(cti_expert)
		tasks.append(cve_search_task)
		answer_context.append(cve_search_task)

	if execution_route in {"crew_breach_analysis", "crew_full_analysis"}:
		breach_intel_task = Task(
			description=tasks_config["breach_intel_task"]["description"],
			expected_output=tasks_config["breach_intel_task"]["expected_output"],
			agent=breach_intel_expert,
		)
		agents.append(breach_intel_expert)
		tasks.append(breach_intel_task)
		answer_context.append(breach_intel_task)

	answer_description = tasks_config["answer_task"]["description"]
	if execution_route == "crew_cve_analysis":
		answer_description += (
			" Bu çalışma sadece CVE/zafiyet analizidir; şirket ihlali veya breach "
			"intelligence notu yoksa bundan ayrıca bahsetme."
		)
	elif execution_route == "crew_breach_analysis":
		answer_description += (
			" Bu çalışma sadece şirket ihlali/saldırı vektörü analizidir; güncel CVE "
			"listesi yoksa bundan ayrıca bahsetme."
		)

	answer_task = Task(
		description=answer_description,
		expected_output=tasks_config["answer_task"]["expected_output"],
		agent=spokesperson,
		context=answer_context,
	)

	agents.append(spokesperson)
	tasks.append(answer_task)

	return Crew(
		agents=agents,
		tasks=tasks,
		process=Process.sequential,
		verbose=True,
	)


@app.get("/health")
def health_check() -> dict[str, str]:
	"""Servisin ayakta olup olmadığını hızlıca doğrular."""

	return {"status": "ok"}


@app.post("/ask")
def ask_question(data: AskRequest) -> dict[str, str]:
	"""Ziyaretçi sorusunu alır, CrewAI çalıştırır ve sonucu JSON döner."""

	if not data.question.strip():
		raise HTTPException(status_code=400, detail="question alanı boş olamaz")

	today_context = get_today_context()

	if is_date_or_day_question(data.question):
		return {
			"result": (
				f"Bugün {today_context['today_text']}, günlerden {today_context['weekday_tr']}."
			)
		}

	if is_contact_question(data.question):
		return {"result": get_contact_response()}

	
	return {"result": run_crewai_pipeline(data.question, today_context)}


# ---------------------------------------------------------------------------
# LangGraph endpoint
# ---------------------------------------------------------------------------

try:
	from crewai_api.langgraph_workflow import (
		langgraph_app as _lg_app,
		unified_router_app as _unified_router_app,
	)
	_LANGGRAPH_AVAILABLE = True
except ImportError:
	try:
		from langgraph_workflow import (
			langgraph_app as _lg_app,
			unified_router_app as _unified_router_app,
		)
		_LANGGRAPH_AVAILABLE = True
	except ImportError:
		_lg_app = None
		_unified_router_app = None
		_LANGGRAPH_AVAILABLE = False

try:
	from crewai_api.mcp_client_demo import run_mcp_demo as _run_mcp_demo
	_MCP_AVAILABLE = True
	_MCP_IMPORT_ERROR = ""
except ImportError as error:
	try:
		from mcp_client_demo import run_mcp_demo as _run_mcp_demo
		_MCP_AVAILABLE = True
		_MCP_IMPORT_ERROR = ""
	except ImportError as fallback_error:
		_run_mcp_demo = None
		_MCP_AVAILABLE = False
		_MCP_IMPORT_ERROR = f"{error}; {fallback_error}"


def fallback_unified_route(question: str) -> dict[str, str]:
	"""LangGraph router yüklenemezse kullanılacak basit rota seçici."""

	text = question.lower()
	cve_keywords = [
		"cve",
		"zafiyet",
		"vulnerability",
		"exploit",
		"zero-day",
		"zeroday",
		"kritik açık",
		"kritik acik",
	]
	breach_keywords = [
		"ransomware",
		"hack",
		"hacklendi",
		"hacklenen",
		"ihlal",
		"breach",
		"sızıntı",
		"sizinti",
		"veri sızıntısı",
		"veri sizintisi",
		"veri ihlali",
		"saldırı vektörü",
		"saldiri vektoru",
		"siber saldırı",
		"siber saldiri",
		"cyberattack",
		"cyber attack",
		"data breach",
		"son ihlal",
		"hacked company",
		"hacklenen şirket",
		"hacklenen sirket",
		"bildirim",
		"uyarı",
		"uyari",
	]

	has_cve_signal = any(keyword in text for keyword in cve_keywords)
	has_breach_signal = any(keyword in text for keyword in breach_keywords)

	if has_cve_signal and has_breach_signal:
		return {
			"execution_route": "crew_full_analysis",
			"route_reason": "Fallback router, soruda hem CVE hem şirket ihlali sinyali gördü.",
		}

	if has_cve_signal:
		return {
			"execution_route": "crew_cve_analysis",
			"route_reason": "Fallback router, soruyu CVE/zafiyet analizi olarak sınıflandırdı.",
		}

	if has_breach_signal:
		return {
			"execution_route": "crew_breach_analysis",
			"route_reason": "Fallback router, soruyu şirket ihlali analizi olarak sınıflandırdı.",
		}

	return {
		"execution_route": "mcp_direct",
		"route_reason": "Fallback router, sorunun portfolio context'iyle cevaplanabileceğine karar verdi.",
	}


@app.post("/ask-agent")
async def ask_agent(data: AskRequest) -> dict[str, Any]:
	"""MCP context + LangGraph router + CrewAI ajanlarını tek pipeline'da çalıştırır."""

	question = data.question.strip()
	if not question:
		raise HTTPException(status_code=400, detail="question alanı boş olamaz")

	today_context = get_today_context()
	trace: list[str] = [
		"Tek AI pipeline başladı: MCP context, LangGraph router ve CrewAI execution aynı endpoint altında yönetiliyor."
	]

	if is_date_or_day_question(question):
		trace.append("Basit tarih sorusu local guard ile cevaplandı.")
		return {
			"result": f"Bugün {today_context['today_text']}, günlerden {today_context['weekday_tr']}.",
			"trace": trace,
		}

	mcp_result: dict[str, Any] | None = None
	if _MCP_AVAILABLE and _run_mcp_demo is not None:
		try:
			mcp_result = await _run_mcp_demo(question)
			trace.append("MCP context katmanı çalıştı: resource/tool/prompt keşfi ve context okuma tamamlandı.")
		except Exception as error:
			trace.append(f"MCP context katmanı hata aldı, pipeline devam ediyor: {error}")
	else:
		trace.append(f"MCP context katmanı kullanılamıyor: {_MCP_IMPORT_ERROR}")

	if _LANGGRAPH_AVAILABLE and _unified_router_app is not None:
		router_result = _unified_router_app.invoke({
			"visitor_question": question,
			"today_iso": today_context["today_iso"],
			"today_text": today_context["today_text"],
			"weekday_tr": today_context["weekday_tr"],
		})
	else:
		router_result = fallback_unified_route(question)

	execution_route = str(router_result.get("execution_route", "crew_analysis"))
	route_reason = str(router_result.get("route_reason", "Rota açıklaması yok."))
	trace.append(f"LangGraph router kararı: {execution_route}. {route_reason}")

	if execution_route == "mcp_direct" and mcp_result is not None:
		trace.append("CrewAI çalıştırılmadı; MCP context cevabı yeterli görüldü.")
		return {
			"result": str(mcp_result.get("result", "")).strip(),
			"trace": trace,
			"mcp": mcp_result.get("mcp"),
		}

	if execution_route == "mcp_direct":
		trace.append("MCP cevabı alınamadı; local portfolio/contact fallback kullanıldı.")
		if is_contact_question(question):
			return {"result": get_contact_response(), "trace": trace}
		return {
			"result": (
				"Kerem Düz, Akdeniz Üniversitesi Bilgisayar Mühendisliği öğrencisi ve "
				"Akdeniz Siber Güvenlik Topluluğu Başkanıdır. İlgi alanları web sızma "
				"testleri, Linux ve donanım projeleridir."
			),
			"trace": trace,
		}

	trace.append(f"CrewAI uzman ajan ekibi çalıştırılıyor: {execution_route}.")
	crew_answer = run_crewai_pipeline(question, today_context, execution_route)
	trace.append("CrewAI execution tamamlandı; final cevap üretildi.")

	return {
		"result": crew_answer,
		"trace": trace,
		"mcp": mcp_result.get("mcp") if mcp_result else None,
	}


@app.post("/ask-langgraph")
def ask_langgraph(data: AskRequest) -> dict[str, str]:
	"""LangGraph iş akışı ile soru cevaplar."""

	if not data.question.strip():
		raise HTTPException(status_code=400, detail="question alanı boş olamaz")

	today_context = get_today_context()

	if is_date_or_day_question(data.question):
		return {
			"result": (
				f"Bugün {today_context['today_text']}, günlerden {today_context['weekday_tr']}."
			)
		}

	if is_contact_question(data.question):
		return {"result": get_contact_response()}

	if not _LANGGRAPH_AVAILABLE:
		raise HTTPException(
			status_code=503,
			detail="LangGraph modülü yüklenemedi. 'pip install langgraph langchain-openai' komutunu çalıştırın.",
		)

	if not has_openai_key():
		raise HTTPException(
			status_code=503,
			detail="OPENAI_API_KEY bulunamadı.",
		)

	try:
		result = _lg_app.invoke({
			"visitor_question": data.question,
			"today_iso": today_context["today_iso"],
			"today_text": today_context["today_text"],
			"weekday_tr": today_context["weekday_tr"],
		})
		return {"result": result["final_answer"]}
	except Exception as error:
		raise HTTPException(
			status_code=500, detail=f"LangGraph çalıştırılamadı: {error}"
		) from error


@app.post("/mcp-demo")
async def mcp_demo(data: AskRequest) -> dict[str, Any]:
	"""MCP server/client akışını görünür biçimde çalıştırır."""

	if not data.question.strip():
		raise HTTPException(status_code=400, detail="question alanı boş olamaz")

	if not _MCP_AVAILABLE or _run_mcp_demo is None:
		raise HTTPException(
			status_code=503,
			detail=f"MCP demo modülü yüklenemedi. mcp paketini kurun. Hata: {_MCP_IMPORT_ERROR}",
		)

	try:
		return await _run_mcp_demo(data.question)
	except Exception as error:
		raise HTTPException(status_code=500, detail=f"MCP demo çalıştırılamadı: {error}") from error


if __name__ == "__main__":
	# API'yi 8010 portunda ayağa kaldır.
	uvicorn.run("app:app", host="0.0.0.0", port=8010, reload=True)
