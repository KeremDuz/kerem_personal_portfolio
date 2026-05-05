"""Portfolio assistant shared context.

This module keeps the local portfolio facts in one place so CrewAI, LangGraph,
and the MCP demo can all read the same source of truth.
"""

from __future__ import annotations

import os


KEREM_PROFILE = """
- Ad Soyad: Kerem DÜZ
- Üniversite: Akdeniz Üniversitesi – Bilgisayar Mühendisliği
- Topluluk: Akdeniz Siber Güvenlik Topluluğu Başkanı
- İlgi Alanları: Web sızma testleri, Linux, donanım projeleri
- Proje: Son derece gizli bir siber güvenlik projesi üzerinde çalışıyor, detay vermiyor.
- Web Sitesi: www.keremduz.com
- Sosyal Medya: instagramda kerem_plain.
- Telefon numarası: 0505 991 37 75
- Mail Adresi: keremduz0304@gmail.com
"""


CONTACT_KEYWORDS = [
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

SECURITY_KEYWORDS = [
    "cve",
    "zafiyet",
    "vulnerability",
    "açık",
    "acik",
    "siber",
    "cti",
    "pentest",
    "sızma",
    "sizma",
]

PROFILE_KEYWORDS = [
    "kerem",
    "kim",
    "hakkında",
    "hakkinda",
    "profil",
    "cv",
    "özgeçmiş",
    "ozgecmis",
    "üniversite",
    "universite",
    "proje",
]


def get_contact_info() -> dict[str, str]:
    """Return contact info, allowing local env overrides for demos."""

    return {
        "phone": os.getenv("KEREM_PHONE", "0505 991 37 75"),
        "email": os.getenv("KEREM_EMAIL", "keremduz0304@gmail.com"),
        "website": os.getenv("KEREM_WEBSITE", "www.keremduz.com"),
        "instagram": os.getenv("KEREM_INSTAGRAM", "kerem_plain"),
    }


def format_contact_info() -> str:
    """Render contact info in a visitor-friendly format."""

    contact = get_contact_info()
    return (
        f"Telefon: {contact['phone']}\n"
        f"E-posta: {contact['email']}\n"
        f"Web: {contact['website']}\n"
        f"Instagram: {contact['instagram']}"
    )


def classify_portfolio_question(question: str) -> dict[str, str | bool]:
    """Classify a visitor question for the MCP demo."""

    normalized = question.lower()
    asks_contact = any(keyword in normalized for keyword in CONTACT_KEYWORDS)
    asks_security = any(keyword in normalized for keyword in SECURITY_KEYWORDS)
    asks_profile = any(keyword in normalized for keyword in PROFILE_KEYWORDS)

    if asks_contact:
        route = "contact_info"
        explanation = "Soru iletişim bilgisi istiyor; MCP tool get_contact_info çağrılmalı."
    elif asks_security:
        route = "security_context"
        explanation = "Soru siber güvenlik/CVE bağlamı taşıyor; güvenlik odaklı profil notu kullanılmalı."
    elif asks_profile:
        route = "profile_context"
        explanation = "Soru Kerem'in profiliyle ilgili; MCP resource kerem_profile okunmalı."
    else:
        route = "general"
        explanation = "Soru genel; MCP profil resource'u kısa bağlam olarak kullanılmalı."

    return {
        "asks_contact": asks_contact,
        "asks_security": asks_security,
        "asks_profile": asks_profile,
        "route": route,
        "explanation": explanation,
    }


def build_portfolio_context_answer(question: str) -> str:
    """Build a deterministic answer from MCP-provided portfolio context."""

    classification = classify_portfolio_question(question)

    if classification["asks_contact"]:
        return (
            "MCP server üzerindeki get_contact_info aracı çağrıldı.\n\n"
            "Kerem Düz iletişim bilgileri:\n"
            f"{format_contact_info()}"
        )

    if classification["asks_security"]:
        return (
            "MCP server, soruyu siber güvenlik bağlamında sınıflandırdı. "
            "Kerem Düz; web sızma testleri, Linux, donanım projeleri ve siber güvenlik "
            "topluluğu çalışmalarıyla ilgileniyor. Güncel CVE analizi gerekiyorsa "
            "LangGraph/CrewAI tarafındaki CTI arama adımı devreye alınabilir."
        )

    return (
        "MCP server üzerindeki kerem_profile resource'u okundu. "
        "Kerem Düz, Akdeniz Üniversitesi Bilgisayar Mühendisliği öğrencisi ve "
        "Akdeniz Siber Güvenlik Topluluğu Başkanıdır. İlgi alanları web sızma testleri, "
        "Linux ve donanım projeleridir."
    )
