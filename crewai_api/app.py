"""CrewAI + LangGraph + FastAPI mikroservisi.

Bu dosya:
- YAML üzerinden ajan ve görev konfigürasyonlarını okur.
- CrewAI ajanlarını ve görevlerini oluşturur.
- LangGraph iş akışını yükler.
- FastAPI üzerinden `/ask` (CrewAI) ve `/ask-langgraph` endpoint'lerini sağlar.
"""

from pathlib import Path
from datetime import datetime
import os
from typing import Any
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


class DuckDuckGoCrewTool(BaseTool):
	"""CrewAI ile uyumlu DuckDuckGo arama aracı."""

	name: str = "duckduckgo_search"
	description: str = "DuckDuckGo üzerinde web araması yapar ve metin sonuçlarını döndürür."

	def _run(self, query: str) -> str:
		search_tool = DuckDuckGoSearchRun()
		return str(search_tool.invoke(query))


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


def is_private_size_question(question: str) -> bool:
	"""Mahrem beden ölçüsü sorularını tespit eder."""

	text = question.lower()
	private_terms = [
		"penis",
		"dick",
		"cock",
		"pp",
		"cinsel organ",
		"genital",
	]
	size_terms = [
		"boy",
		"uzun",
		"length",
		"size",
		"kaç cm",
		"kaç km",
		"cm",
	]
	has_private = any(term in text for term in private_terms)
	has_size = any(term in text for term in size_terms)
	return has_private and has_size


def get_private_size_response() -> str:
	"""Mahrem beden ölçüsü sorularına sabit cevap döndürür."""

	return "Bu bilgi çok gizli. Sadece müstakbel karım bilebilir."


def has_openai_key() -> bool:
	"""OpenAI anahtarının ortamda tanımlı olup olmadığını kontrol eder."""

	return bool(os.getenv("OPENAI_API_KEY", "").strip())


def build_crew() -> Crew:
	"""Ajanları ve görevleri oluşturup Crew nesnesini döndürür."""

	# Araç tanımı (özellikle cti_expert için zorunlu)
	ddg_tool = DuckDuckGoCrewTool()

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

	cve_search_task = Task(
		description=tasks_config["cve_search_task"]["description"],
		expected_output=tasks_config["cve_search_task"]["expected_output"],
		agent=cti_expert,
	)

	answer_task = Task(
		description=tasks_config["answer_task"]["description"],
		expected_output=tasks_config["answer_task"]["expected_output"],
		agent=spokesperson,
		context=[profile_task, cve_search_task],
	)

	return Crew(
		agents=[cv_researcher, cti_expert, spokesperson],
		tasks=[profile_task, cve_search_task, answer_task],
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

	if is_private_size_question(data.question):
		return {"result": get_private_size_response()}

	if not has_openai_key():
		raise HTTPException(
			status_code=503,
			detail="OPENAI_API_KEY bulunamadı. Anahtarı ortam değişkeni olarak tanımlayıp API'yi yeniden başlatın.",
		)

	try:
		crew = build_crew()
		result = crew.kickoff(
			inputs={
				"visitor_question": data.question,
				"today_iso": today_context["today_iso"],
				"today_text": today_context["today_text"],
				"weekday_tr": today_context["weekday_tr"],
			}
		)
		return {"result": str(result)}
	except Exception as error:
		raise HTTPException(status_code=500, detail=f"Crew çalıştırılamadı: {error}") from error


# ---------------------------------------------------------------------------
# LangGraph endpoint
# ---------------------------------------------------------------------------

try:
	from crewai_api.langgraph_workflow import langgraph_app as _lg_app
	_LANGGRAPH_AVAILABLE = True
except ImportError:
	try:
		from langgraph_workflow import langgraph_app as _lg_app
		_LANGGRAPH_AVAILABLE = True
	except ImportError:
		_lg_app = None
		_LANGGRAPH_AVAILABLE = False


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

	if is_private_size_question(data.question):
		return {"result": get_private_size_response()}

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


if __name__ == "__main__":
	# API'yi 8010 portunda ayağa kaldır.
	uvicorn.run("app:app", host="0.0.0.0", port=8010, reload=True)
