"""Dynamic portfolio context for the assistant.

MCP, LangGraph and CrewAI use this module as the portfolio source of truth.
The primary source is the public website backend API; a local fallback is kept
so the agent still works during local development or Render cold starts.
"""

from __future__ import annotations

import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request
from typing import Any


FALLBACK_KEREM_PROFILE = """
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

# Backward-compatible constant for older imports. Runtime MCP/LangGraph paths
# call get_portfolio_context_text(), so they can reflect website API changes.
KEREM_PROFILE = FALLBACK_KEREM_PROFILE

PUBLIC_ENDPOINTS = {
    "about": "/about",
    "projects": "/projects",
    "timeline": "/timeline",
    "certificates": "/certificates",
    "blogs": "/blogs",
    "travel": "/travel",
}

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
    "linkedin",
    "github",
    "instagram",
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
    "malware",
    "zararlı yazılım",
    "zararli yazilim",
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
    "sertifika",
    "deneyim",
    "eğitim",
    "egitim",
]

_CACHE: dict[str, Any] = {
    "payload": None,
    "context_text": "",
    "summary_text": "",
    "fetched_at": 0.0,
}


def _cache_ttl_seconds() -> int:
    """Return dynamic context cache TTL."""

    raw_value = os.getenv("PORTFOLIO_CONTEXT_CACHE_SECONDS", "60")
    try:
        return max(0, int(raw_value))
    except ValueError:
        return 60


def _request_timeout_seconds() -> float:
    """Return website API request timeout."""

    raw_value = os.getenv("PORTFOLIO_CONTEXT_TIMEOUT_SECONDS", "2.5")
    try:
        return max(0.5, float(raw_value))
    except ValueError:
        return 2.5


def get_portfolio_api_base_url() -> str:
    """Return the public portfolio backend API base URL."""

    base_url = (
        os.getenv("PORTFOLIO_API_BASE_URL")
        or os.getenv("NEXT_PUBLIC_API_URL")
        or os.getenv("PUBLIC_API_URL")
        or "https://antigravitywebsite.onrender.com/api"
    ).strip()

    base_url = base_url.rstrip("/")
    parsed = urllib.parse.urlparse(base_url)
    if not parsed.path.rstrip("/").endswith("/api"):
        base_url = f"{base_url}/api"
    return base_url


def _fetch_json(endpoint: str) -> Any:
    """Fetch one public website API endpoint."""

    url = f"{get_portfolio_api_base_url()}{endpoint}"
    request = urllib.request.Request(
        url,
        headers={
            "Accept": "application/json",
            "User-Agent": "kerem-portfolio-mcp/1.0",
        },
    )
    with urllib.request.urlopen(request, timeout=_request_timeout_seconds()) as response:
        charset = response.headers.get_content_charset() or "utf-8"
        return json.loads(response.read().decode(charset))


def _fetch_portfolio_payload() -> dict[str, Any]:
    """Read website portfolio data from public backend endpoints."""

    payload: dict[str, Any] = {
        "source": "website_api",
        "api_base_url": get_portfolio_api_base_url(),
        "errors": [],
    }

    for name, endpoint in PUBLIC_ENDPOINTS.items():
        try:
            payload[name] = _fetch_json(endpoint)
        except (urllib.error.URLError, TimeoutError, ValueError, json.JSONDecodeError) as error:
            payload[name] = [] if name != "about" else {}
            payload["errors"].append(f"{name}: {error}")

    if not _payload_has_data(payload):
        payload["source"] = "fallback"

    return payload


def _payload_has_data(payload: dict[str, Any]) -> bool:
    """Check whether the website API returned meaningful portfolio data."""

    about = payload.get("about")
    if isinstance(about, dict) and any(about.values()):
        return True

    for name in ["projects", "timeline", "certificates", "blogs", "travel"]:
        value = payload.get(name)
        if isinstance(value, list) and len(value) > 0:
            return True

    return False


def _as_list(value: Any) -> list[dict[str, Any]]:
    """Return active object rows from API data."""

    if not isinstance(value, list):
        return []

    rows = [row for row in value if isinstance(row, dict)]
    return [row for row in rows if row.get("isActive", True)]


def _clean(value: Any) -> str:
    """Normalize a value for context text."""

    if value is None:
        return ""
    return " ".join(str(value).split())


def _tags(value: Any) -> str:
    """Format tag arrays."""

    if not isinstance(value, list):
        return ""
    return ", ".join(_clean(tag) for tag in value if _clean(tag))


def _sort_by_order(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Sort public rows by the same order field used by the website."""

    return sorted(rows, key=lambda row: (row.get("order", 9999), _clean(row.get("title"))))


def _format_about(about: Any) -> list[str]:
    """Format /about API response."""

    if not isinstance(about, dict) or not any(about.values()):
        return [
            "Hakkımda: Kerem Düz, Bilgisayar Mühendisliği öğrencisi ve siber güvenlik tutkunu.",
            "Odak: Web sızma testleri, Linux, donanım projeleri ve savunma odaklı siber güvenlik.",
        ]

    intro = (
        f"{_clean(about.get('p1_1'))} "
        f"{_clean(about.get('p1_2'))}"
        f"{_clean(about.get('p1_3'))}"
    ).strip()
    lines = []
    if intro:
        lines.append(f"Hakkımda: {intro}")
    for key in ["p2", "p3"]:
        if _clean(about.get(key)):
            lines.append(_clean(about[key]))

    details = []
    for label_key, value_key in [
        ("focusLabel", "focusValue"),
        ("expertiseLabel", "expertiseValue"),
        ("locationLabel", "locationValue"),
        ("fuelLabel", "fuelValue"),
    ]:
        label = _clean(about.get(label_key))
        value = _clean(about.get(value_key))
        if label and value:
            details.append(f"{label}: {value}")
    if details:
        lines.append("Özet alanlar: " + " | ".join(details))

    return lines


def _format_timeline(rows: list[dict[str, Any]]) -> list[str]:
    """Format timeline rows."""

    lines = []
    for row in _sort_by_order(rows)[:12]:
        tags = _tags(row.get("tags"))
        suffix = f" [{tags}]" if tags else ""
        lines.append(
            "- "
            f"{_clean(row.get('year'))}: {_clean(row.get('title'))} - "
            f"{_clean(row.get('subtitle'))}. {_clean(row.get('description'))}{suffix}"
        )
    return lines


def _format_projects(rows: list[dict[str, Any]]) -> list[str]:
    """Format project rows."""

    lines = []
    for row in _sort_by_order(rows)[:12]:
        tags = _tags(row.get("tags"))
        suffix = f" Teknolojiler/etiketler: {tags}." if tags else ""
        link = _clean(row.get("link"))
        link_text = f" Link: {link}." if link and link != "#" else ""
        lines.append(
            "- "
            f"{_clean(row.get('title'))}: {_clean(row.get('description'))}"
            f"{suffix}{link_text}"
        )
    return lines


def _format_certificates(rows: list[dict[str, Any]]) -> list[str]:
    """Format certificate rows."""

    lines = []
    for row in _sort_by_order(rows)[:12]:
        date = _clean(row.get("date"))
        date_text = f" ({date})" if date else ""
        lines.append(
            "- "
            f"{_clean(row.get('title'))} - {_clean(row.get('issuer'))}{date_text}"
        )
    return lines


def _format_blogs(rows: list[dict[str, Any]]) -> list[str]:
    """Format blog rows."""

    lines = []
    for row in rows[:8]:
        tags = _tags(row.get("tags"))
        tags_text = f" Etiketler: {tags}." if tags else ""
        lines.append(
            "- "
            f"{_clean(row.get('title'))}: {_clean(row.get('excerpt'))}"
            f" Kategori: {_clean(row.get('category'))}.{tags_text}"
        )
    return lines


def _format_travel(rows: list[dict[str, Any]]) -> list[str]:
    """Format travel rows."""

    lines = []
    for row in _sort_by_order(rows)[:10]:
        lines.append(
            "- "
            f"{_clean(row.get('label'))}, {_clean(row.get('country'))}: "
            f"{_clean(row.get('description'))}"
        )
    return lines


def build_portfolio_context_text(payload: dict[str, Any]) -> str:
    """Render API payload as MCP-readable portfolio context."""

    if payload.get("source") == "fallback":
        errors = payload.get("errors") or []
        error_note = f"\nAPI fallback nedeni: {' | '.join(errors[:3])}" if errors else ""
        return FALLBACK_KEREM_PROFILE.strip() + error_note

    sections = [
        "Kaynak: www.keremduz.com public backend API verisi.",
        f"API base: {payload.get('api_base_url')}",
    ]

    sections.extend(_format_about(payload.get("about")))

    timeline_lines = _format_timeline(_as_list(payload.get("timeline")))
    if timeline_lines:
        sections.append("Deneyim/Eğitim:")
        sections.extend(timeline_lines)

    project_lines = _format_projects(_as_list(payload.get("projects")))
    if project_lines:
        sections.append("Projeler:")
        sections.extend(project_lines)

    certificate_lines = _format_certificates(_as_list(payload.get("certificates")))
    if certificate_lines:
        sections.append("Sertifikalar:")
        sections.extend(certificate_lines)

    blog_lines = _format_blogs(_as_list(payload.get("blogs")))
    if blog_lines:
        sections.append("Yazılar/Blog:")
        sections.extend(blog_lines)

    travel_lines = _format_travel(_as_list(payload.get("travel")))
    if travel_lines:
        sections.append("Seyahat/Anılar:")
        sections.extend(travel_lines)

    sections.append("İletişim:")
    sections.append(format_contact_info())

    errors = payload.get("errors") or []
    if errors:
        sections.append("Kısmi API uyarıları: " + " | ".join(errors[:3]))

    return "\n".join(line for line in sections if _clean(line))


def build_portfolio_summary_text(payload: dict[str, Any]) -> str:
    """Build a short deterministic summary from dynamic portfolio data."""

    if payload.get("source") == "fallback":
        return (
            "Kerem Düz, Akdeniz Üniversitesi Bilgisayar Mühendisliği öğrencisi ve "
            "siber güvenlik odaklı bir yazılım geliştiricidir. Web sızma testleri, "
            "Linux ve donanım projeleriyle ilgilenir."
        )

    about_lines = _format_about(payload.get("about"))
    project_titles = [
        _clean(row.get("title"))
        for row in _sort_by_order(_as_list(payload.get("projects")))[:5]
        if _clean(row.get("title"))
    ]
    cert_titles = [
        _clean(row.get("title"))
        for row in _sort_by_order(_as_list(payload.get("certificates")))[:4]
        if _clean(row.get("title"))
    ]

    parts = about_lines[:3]
    if project_titles:
        parts.append("Öne çıkan projeler: " + ", ".join(project_titles) + ".")
    if cert_titles:
        parts.append("Öne çıkan sertifikalar: " + ", ".join(cert_titles) + ".")

    return "\n".join(parts)


def get_portfolio_payload(force_refresh: bool = False) -> dict[str, Any]:
    """Return cached dynamic portfolio payload."""

    now = time.time()
    cache_is_fresh = (
        not force_refresh
        and _CACHE["payload"] is not None
        and now - float(_CACHE["fetched_at"]) < _cache_ttl_seconds()
    )
    if cache_is_fresh:
        return _CACHE["payload"]

    payload = _fetch_portfolio_payload()
    context_text = build_portfolio_context_text(payload)
    summary_text = build_portfolio_summary_text(payload)

    _CACHE.update(
        {
            "payload": payload,
            "context_text": context_text,
            "summary_text": summary_text,
            "fetched_at": now,
        }
    )
    return payload


def get_portfolio_context_text(force_refresh: bool = False) -> str:
    """Return MCP context text generated from the website API."""

    payload = get_portfolio_payload(force_refresh=force_refresh)
    if not force_refresh and _CACHE["context_text"]:
        return str(_CACHE["context_text"])
    return build_portfolio_context_text(payload)


def get_portfolio_summary_text(force_refresh: bool = False) -> str:
    """Return a short profile summary generated from website data."""

    payload = get_portfolio_payload(force_refresh=force_refresh)
    if not force_refresh and _CACHE["summary_text"]:
        return str(_CACHE["summary_text"])
    return build_portfolio_summary_text(payload)


def get_contact_info() -> dict[str, str]:
    """Return contact info, allowing env overrides for deployments."""

    return {
        "phone": os.getenv("KEREM_PHONE", "0505 991 37 75"),
        "email": os.getenv("KEREM_EMAIL", "keremduz0304@gmail.com"),
        "website": os.getenv("KEREM_WEBSITE", "www.keremduz.com"),
        "instagram": os.getenv("KEREM_INSTAGRAM", "kerem_plain"),
        "github": os.getenv("KEREM_GITHUB", "https://github.com/KeremDuz"),
        "linkedin": os.getenv(
            "KEREM_LINKEDIN",
            "https://www.linkedin.com/in/kerem-d%C3%BCz-687741236/",
        ),
    }


def format_contact_info() -> str:
    """Render contact info in a visitor-friendly format."""

    contact = get_contact_info()
    return (
        f"Telefon: {contact['phone']}\n"
        f"E-posta: {contact['email']}\n"
        f"Web: {contact['website']}\n"
        f"Instagram: {contact['instagram']}\n"
        f"GitHub: {contact['github']}\n"
        f"LinkedIn: {contact['linkedin']}"
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
        explanation = "Soru siber güvenlik/CVE bağlamı taşıyor; site API kaynaklı portfolio context kullanılmalı."
    elif asks_profile:
        route = "profile_context"
        explanation = "Soru Kerem'in profiliyle ilgili; MCP resource kerem_profile site API verisinden okunmalı."
    else:
        route = "general"
        explanation = "Soru genel; MCP site API portfolio context'i kısa bağlam olarak kullanılmalı."

    return {
        "asks_contact": asks_contact,
        "asks_security": asks_security,
        "asks_profile": asks_profile,
        "route": route,
        "explanation": explanation,
    }


def build_portfolio_context_answer(question: str) -> str:
    """Build a deterministic answer from MCP-provided dynamic portfolio context."""

    classification = classify_portfolio_question(question)

    if classification["asks_contact"]:
        return (
            "MCP server üzerindeki get_contact_info aracı çağrıldı.\n\n"
            "Kerem Düz iletişim bilgileri:\n"
            f"{format_contact_info()}"
        )

    payload = get_portfolio_payload()
    if payload.get("source") == "fallback":
        source_note = "MCP server site API'ye ulaşamadı; güvenli fallback portfolio context'i kullanıldı."
    else:
        source_note = "MCP server, www.keremduz.com public backend API'sinden güncel portfolio context'i okudu."
    summary = get_portfolio_summary_text()

    if classification["asks_security"]:
        return (
            f"{source_note}\n\n"
            "Siber güvenlik bağlamı:\n"
            f"{summary}\n\n"
            "Güncel CVE veya şirket ihlali analizi gerekiyorsa LangGraph router "
            "CrewAI tarafındaki CTI/breach ajanlarını devreye alır."
        )

    return f"{source_note}\n\n{summary}"
