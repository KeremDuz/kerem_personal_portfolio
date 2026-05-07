"""Local MCP server for the portfolio assistant demo.

Standalone stdio run:
    python -m crewai_api.mcp_server

The FastAPI `/mcp-demo` endpoint imports this same server and runs it through
an in-memory MCP session for a deterministic classroom demo.
"""

from __future__ import annotations

import json

from mcp.server.fastmcp import FastMCP

try:
    from crewai_api.portfolio_context import (
        build_portfolio_context_answer,
        classify_portfolio_question,
        format_contact_info,
        get_portfolio_context_text,
    )
except ImportError:
    from portfolio_context import (
        build_portfolio_context_answer,
        classify_portfolio_question,
        format_contact_info,
        get_portfolio_context_text,
    )


mcp = FastMCP(
    name="Kerem Portfolio MCP",
    log_level="ERROR",
    instructions=(
        "Kerem Düz portfolio assistant için profil resource'u, iletişim tool'u "
        "ve demo prompt'u sağlar."
    ),
)


@mcp.resource(
    "portfolio://kerem/profile",
    name="kerem_profile",
    description="Kerem Düz hakkında portfolio asistanının kullanacağı temel profil bilgileri.",
    mime_type="text/plain",
)
def kerem_profile_resource() -> str:
    """Expose the live website portfolio context as an MCP resource."""

    return get_portfolio_context_text().strip()


@mcp.tool(
    name="get_contact_info",
    description="Kerem Düz iletişim bilgilerini portfolio context'inden döndürür.",
)
def get_contact_info_tool() -> str:
    """Return contact information through MCP tools/call."""

    return format_contact_info()


@mcp.tool(
    name="classify_portfolio_question",
    description="Ziyaretçi sorusunun profil, iletişim veya siber güvenlik bağlamını sınıflandırır.",
)
def classify_portfolio_question_tool(question: str) -> str:
    """Classify the incoming visitor question."""

    classification = classify_portfolio_question(question)
    return json.dumps(classification, ensure_ascii=False, indent=2)


@mcp.tool(
    name="answer_from_portfolio_context",
    description="MCP resource/tool çıktılarıyla kısa ve deterministik portfolio cevabı üretir.",
)
def answer_from_portfolio_context_tool(question: str) -> str:
    """Build a demo answer from local MCP context."""

    return build_portfolio_context_answer(question)


@mcp.prompt(
    name="portfolio_assistant_prompt",
    description="Kerem portfolio asistanının MCP context'iyle nasıl cevap vermesi gerektiğini anlatır.",
)
def portfolio_assistant_prompt(question: str) -> str:
    """Return a reusable prompt template for MCP clients."""

    return (
        "Sen www.keremduz.com için çalışan dijital asistansın.\n"
        "MCP server'dan gelen resource ve tool çıktılarını kaynak bağlam olarak kullan.\n"
        "Ziyaretçiye kısa, profesyonel ve samimi Türkçe ile cevap ver.\n\n"
        f"Ziyaretçi sorusu: {question}"
    )


if __name__ == "__main__":
    mcp.run(transport="stdio")
