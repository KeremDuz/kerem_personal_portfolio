"""MCP client demo used by the FastAPI `/mcp-demo` endpoint."""

from __future__ import annotations

from datetime import timedelta
from typing import Any

import anyio
from mcp.client.session import ClientSession
from mcp.shared.message import SessionMessage
from pydantic import AnyUrl, TypeAdapter

try:
    from crewai_api.mcp_server import mcp as portfolio_mcp
except ImportError:
    from mcp_server import mcp as portfolio_mcp


URI_ADAPTER = TypeAdapter(AnyUrl)


async def _start_in_memory_mcp_server(
    client_to_server_recv: Any,
    server_to_client_send: Any,
) -> None:
    """Run the FastMCP server through MCP SDK streams."""

    server = portfolio_mcp._mcp_server
    await server.run(
        client_to_server_recv,
        server_to_client_send,
        server.create_initialization_options(),
    )


def _content_text(content_blocks: list[Any]) -> str:
    """Extract human-readable text from MCP content blocks."""

    parts: list[str] = []
    for block in content_blocks:
        text = getattr(block, "text", None)
        if text:
            parts.append(text)
            continue

        resource = getattr(block, "resource", None)
        resource_text = getattr(resource, "text", None)
        if resource_text:
            parts.append(resource_text)

    return "\n".join(parts).strip()


async def run_mcp_demo(question: str) -> dict[str, Any]:
    """Start the local MCP server and demonstrate MCP protocol calls."""

    clean_question = question.strip()
    if not clean_question:
        raise ValueError("question alanı boş olamaz")

    trace: list[str] = [
        "FastAPI endpoint'i MCP client rolünü üstlendi.",
        "MCP server, SDK'nın ClientSession/ServerSession akışıyla in-memory transport üzerinde başlatılıyor.",
    ]

    client_to_server_send, client_to_server_recv = anyio.create_memory_object_stream[SessionMessage | Exception](0)
    server_to_client_send, server_to_client_recv = anyio.create_memory_object_stream[SessionMessage | Exception](0)

    async with anyio.create_task_group() as task_group:
        task_group.start_soon(
            _start_in_memory_mcp_server,
            client_to_server_recv,
            server_to_client_send,
        )

        async with ClientSession(
            server_to_client_recv,
            client_to_server_send,
            read_timeout_seconds=timedelta(seconds=8),
        ) as session:
            initialize_result = await session.initialize()
            server_info = initialize_result.serverInfo
            trace.append(
                f"initialize tamamlandı: {server_info.name} server'ı MCP protokolüyle hazır."
            )

            tools_result = await session.list_tools()
            tools = [
                {
                    "name": tool.name,
                    "description": tool.description or "",
                }
                for tool in tools_result.tools
            ]
            trace.append(
                "tools/list çağrıldı; client server'ın sunduğu araçları keşfetti: "
                + ", ".join(tool["name"] for tool in tools)
            )

            resources_result = await session.list_resources()
            resources = [
                {
                    "name": resource.name,
                    "uri": str(resource.uri),
                    "description": resource.description or "",
                }
                for resource in resources_result.resources
            ]
            trace.append(
                "resources/list çağrıldı; okunabilir portfolio resource'ları listelendi."
            )

            prompts_result = await session.list_prompts()
            prompts = [
                {
                    "name": prompt.name,
                    "description": prompt.description or "",
                }
                for prompt in prompts_result.prompts
            ]
            trace.append(
                "prompts/list çağrıldı; MCP server'ın sağladığı prompt şablonu görüldü."
            )

            profile_uri = URI_ADAPTER.validate_python("portfolio://kerem/profile")
            profile_result = await session.read_resource(profile_uri)
            profile_text = "\n".join(
                getattr(content, "text", "")
                for content in profile_result.contents
                if getattr(content, "text", "")
            ).strip()
            trace.append(
                "resources/read ile portfolio://kerem/profile resource'u okundu."
            )

            classify_result = await session.call_tool(
                "classify_portfolio_question",
                {"question": clean_question},
            )
            classification_text = _content_text(classify_result.content)
            trace.append(
                "tools/call ile classify_portfolio_question aracı çalıştırıldı."
            )

            contact_result = await session.call_tool("get_contact_info")
            contact_text = _content_text(contact_result.content)
            trace.append("tools/call ile get_contact_info aracı çalıştırıldı.")

            answer_result = await session.call_tool(
                "answer_from_portfolio_context",
                {"question": clean_question},
            )
            answer_text = _content_text(answer_result.content)
            trace.append(
                "tools/call ile final demo cevabı MCP context'inden üretildi."
            )

            prompt_result = await session.get_prompt(
                "portfolio_assistant_prompt",
                {"question": clean_question},
            )
            prompt_text = _content_text([message.content for message in prompt_result.messages])
            trace.append(
                "prompts/get ile asistan prompt'u alındı; modelin bu context'i nasıl kullanacağı gösterildi."
            )

        task_group.cancel_scope.cancel()

    return {
        "result": answer_text,
        "trace": trace,
        "mcp": {
            "transport": "in-memory",
            "server": {
                "name": server_info.name,
                "version": server_info.version,
            },
            "tools": tools,
            "resources": resources,
            "prompts": prompts,
            "profile_excerpt": profile_text[:500],
            "classification": classification_text,
            "contact_info": contact_text,
            "prompt_preview": prompt_text[:500],
        },
    }
