"""LangGraph iş akışı modülü.

CrewAI'deki 3 ajan mantığının LangGraph karşılığı:
  1. research_node  → Profil bilgisi çıkar (cv_researcher)
  2. cti_node       → DuckDuckGo ile güncel CVE araştır (cti_expert)
  3. answer_node    → İki kaynağı harmanlayıp final cevap üret (spokesperson)

Graph akışı:
  START → research → cti_search → answer → END
"""

from __future__ import annotations

import os
from datetime import datetime
from typing import Annotated
from zoneinfo import ZoneInfo

from langchain_community.tools import DuckDuckGoSearchRun
from langchain_openai import ChatOpenAI
from langgraph.graph import END, StateGraph
from typing_extensions import TypedDict


# ---------------------------------------------------------------------------
# LangSmith Tracing (opsiyonel – key varsa otomatik aktif)
# ---------------------------------------------------------------------------

if os.getenv("LANGSMITH_API_KEY"):
    os.environ.setdefault("LANGSMITH_TRACING", "true")
    os.environ.setdefault("LANGSMITH_ENDPOINT", "https://eu.api.smith.langchain.com")
    os.environ.setdefault("LANGSMITH_PROJECT", "langgraph web")




# ---------------------------------------------------------------------------
# State
# ---------------------------------------------------------------------------

class AgentState(TypedDict):
    """Graph boyunca taşınan veri."""

    visitor_question: str
    today_text: str
    weekday_tr: str
    today_iso: str
    profile_notes: str
    cti_notes: str
    final_answer: str


# ---------------------------------------------------------------------------
# Kerem DÜZ profil bilgisi (ajan hafızası)
# ---------------------------------------------------------------------------

KEREM_PROFILE = """
- Ad Soyad: Kerem DÜZ
- Üniversite: Akdeniz Üniversitesi – Bilgisayar Mühendisliği
- Topluluk: Akdeniz Siber Güvenlik Topluluğu Başkanı
- İlgi Alanları: Web sızma testleri, Linux, donanım projeleri
- Proje: File Upload Detector (açık kaynak)
- Web Sitesi: www.keremduz.com
"""


# ---------------------------------------------------------------------------
# Node fonksiyonları
# ---------------------------------------------------------------------------

def research_node(state: AgentState) -> dict:
    """Profil araştırmacısı – soruyla ilgili Kerem bilgisi çıkarır."""

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.3)

    prompt = f"""Sen Kerem DÜZ'ün dijital hafızasısın.
Profil bilgileri:
{KEREM_PROFILE}

Ziyaretçi sorusu: "{state['visitor_question']}"
Bugün: {state['today_text']} ({state['weekday_tr']})

Görev: Soru Kerem ile ilgiliyse kısa profil notu çıkar. İlgili değilse "Soru Kerem ile ilgili değil" yaz.
"""
    response = llm.invoke(prompt)
    return {"profile_notes": response.content}


def cti_node(state: AgentState) -> dict:
    """CTI uzmanı – güncel CVE/zafiyet araştırır."""

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.2)
    search = DuckDuckGoSearchRun()

    # Sorunun zafiyet/CVE ile ilgili olup olmadığını kontrol et
    check_prompt = f"""Şu soru siber güvenlik zafiyeti veya CVE ile ilgili mi?
Soru: "{state['visitor_question']}"
Sadece "EVET" veya "HAYIR" yaz."""

    check = llm.invoke(check_prompt)

    if "EVET" in check.content.upper():
        search_query = f"latest critical CVEs today {state['today_iso']}"
        search_results = search.invoke(search_query)

        summary_prompt = f"""Aşağıdaki arama sonuçlarından güncel CVE bilgilerini özetle:
{search_results}

Kısa ve teknik bir özet yaz."""
        summary = llm.invoke(summary_prompt)
        return {"cti_notes": summary.content}

    return {"cti_notes": "Soru zafiyetlerle ilgili değil."}


def answer_node(state: AgentState) -> dict:
    """İletişim uzmanı – final cevabı üretir."""

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)

    prompt = f"""Sen www.keremduz.com adresindeki resmi dijital asistansın.

Profil araştırmacısının notu:
{state['profile_notes']}

CTI uzmanının notu:
{state['cti_notes']}

Ziyaretçinin sorusu: "{state['visitor_question']}"
Bugün: {state['today_text']} ({state['weekday_tr']})

Görev: İki kaynağı harmanlayarak ziyaretçiye profesyonel, samimi ve akıcı Türkçe ile yanıt ver.
Tarih/gün sorulursa sadece verilen bilgileri kullan, uydurma.
"""
    response = llm.invoke(prompt)
    return {"final_answer": response.content}


# ---------------------------------------------------------------------------
# Graph oluşturma
# ---------------------------------------------------------------------------

def build_langgraph() -> StateGraph:
    """LangGraph iş akışını kurar ve derlenmiş graph döner."""

    workflow = StateGraph(AgentState)

    workflow.add_node("research", research_node)
    workflow.add_node("cti_search", cti_node)
    workflow.add_node("answer", answer_node)

    workflow.set_entry_point("research")
    workflow.add_edge("research", "cti_search")
    workflow.add_edge("cti_search", "answer")
    workflow.add_edge("answer", END)

    return workflow.compile()


# Modül seviyesinde derle – her import'ta yeniden kurulmasın
langgraph_app = build_langgraph()
