"""
Belentani MCP Server — Tool server for the Belentani / NOIACORE ecosystem.

Tools:
  - belentani_projects: List canonical projects
  - belentani_ai_validate: Validate AI endpoint payloads
  - belentani_data_anonymize: Strip PII from text

Usage:
  # Install
  pip install -e ".[dev]"

  # Run
  python -m belentani_mcp

  # Or via MCP inspector
  mcp inspect python belentani_mcp/__main__.py
"""
from __future__ import annotations

import os
import re
import hashlib
from typing import Any, Sequence

from mcp.server import Server
from mcp.server.models import InitializationOptions
import mcp.types as types
from mcp.server import NotificationOptions
from mcp.server.async_stream import AsyncStreamTool
from mcp.server.async_session import AsyncSession
from mcp.transport.streamable_http import StreamableHTTPTransport

import logging
import structlog

logger = structlog.get_logger()

server = Server("belentani-mcp")

# ============================================================
# PII patterns
# ============================================================
PII_PATTERNS = [
    (r'\b[\w.-]+@[\w.-]+\.\w+\b', '[EMAIL_REDACTED]'),
    (r'\b\d{8,12}[A-Z]\b', '[DNI_REDACTED]'),  # Spanish NIF
    (r'\b\d{9,15}\b', '[PHONE_REDACTED]'),
    (r'\b\d{13,19}\b', '[CARD_REDACTED]'),  # Credit card
    (r'\b\d{1,2}/\d{1,2}/\d{2,4}\b', '[DATE_REDACTED]'),  # Date
]

# ============================================================
# Canonical projects catalog
# ============================================================
CANONICAL_PROJECTS = [
    {
        "id": "belentani-universe",
        "name": "Belentani Universe",
        "description": "Artist universe, creative technology, and narrative",
        "tags": ["3D", "WebGL", "Storytelling", "audio"],
        "status": "🟢 READY",
        "repo": "belentani.es",
        "url": "https://belentani.es",
    },
    {
        "id": "manos-abiertas",
        "name": "Manos Abiertas",
        "description": "AI and Office education for migrants",
        "tags": ["education", "ai", "offline", "react"],
        "status": "🟡 IN PROGRESS",
        "repo": "ManosAbiertas",
        "url": "https://manos-abiertas-psi.vercel.app",
    },
    {
        "id": "linguaforge",
        "name": "LinguaForge",
        "description": "Open-source language learning with CEFR progression",
        "tags": ["education", "srs", "ai-tutor", "i18n"],
        "status": "🟢 READY",
        "repo": "linguaforge",
        "url": "https://linguaforge.vercel.app",
    },
    {
        "id": "secure-t",
        "name": "Secure T",
        "description": "Cybersecurity and AI governance campus",
        "tags": ["security", "education", "gitleaks", "python"],
        "status": "🟢 READY",
        "repo": "secure-t",
        "url": "https://belentani7.github.io/secure-t/",
    },
    {
        "id": "open-school",
        "name": "Open School",
        "description": "Digital institute for newcomers (offline-first)",
        "tags": ["education", "pwa", "react", "offline"],
        "status": "🟡 IN PROGRESS",
        "repo": "open-school",
        "url": "https://open-school-gamma.vercel.app",
    },
    {
        "id": "belentani-cv-ai",
        "name": "Belentani CV-AI",
        "description": "AI-powered document studio, GDPR compliant",
        "tags": ["ai", "nextjs", "prisma", "pdf"],
        "status": "🟡 IN PROGRESS",
        "repo": "Belentani.cv-ai",
        "url": "https://belentani-cv-ai.vercel.app",
    },
    {
        "id": "cruzando",
        "name": "Cruzando el Charco",
        "description": "LGBTQI+ migrant guide for Catalonia",
        "tags": ["guide", "static", "pwa", "accessibility"],
        "status": "🟢 READY",
        "repo": "cruzando-el-charco-web",
        "url": "https://cruzando.elbelentani.cat",
    },
    {
        "id": "judas-experience",
        "name": "Judas Experience",
        "description": "Musical WebGL narrative — Judas Era Canon 0",
        "tags": ["webgl", "audio", "storytelling"],
        "status": "🔴 BLOCKED",
        "repo": "judas-experience",
        "url": "https://judas-experience-13898.buildaispace.app/",
    },
]


@server.list_tools()
async def handle_list_tools() -> list[types.Tool]:
    return [
        types.Tool(
            name="belentani_projects",
            description="List all Belentani / NOIACORE canonical projects with their status, tags, and repository links.",
            arguments=[],
        ),
        types.Tool(
            name="belentani_ai_validate",
            description="Validate AI endpoint payloads for PII, injection patterns, and schema compliance. Returns safe or rejected with reasons.",
            arguments=[
                types.ToolArgument(
                    name="content",
                    description="The user content to validate. Must be under 5000 chars.",
                    required=True,
                ),
                types.ToolArgument(
                    name="doc_type",
                    description="Document type: cv, cover, or presentation.",
                    required=False,
                ),
            ],
        ),
        types.Tool(
            name="belentani_anonymize",
            description="Strip PII from text using regex patterns. Returns anonymized text and list of redactions.",
            arguments=[
                types.ToolArgument(
                    name="text",
                    description="Text to anonymize. Recommended to call before sending to any LLM.",
                    required=True,
                ),
            ],
        ),
    ]


@server.call_tool()
async def handle_call_tool(name: str, arguments: dict[str, Any] | None) -> list[types.TextContent | types.ImageContent | types.EmbeddedResource]:
    if name == "belentani_projects":
        result = {"projects": CANONICAL_PROJECTS}
        return [
            types.TextContent(
                type="text",
                text=json.dumps(result, indent=2, ensure_ascii=False),
            )
        ]

    if name == "belentani_ai_validate":
        content = arguments.get("content", "")
        doc_type = arguments.get("doc_type", "cv")

        # PII check
        redactions = []
        for pattern, replacement in PII_PATTERNS:
            matches = re.findall(pattern, content, re.IGNORECASE)
            if matches:
                redactions.extend(matches)
                content = re.sub(pattern, replacement, content, flags=re.IGNORECASE)

        # Injection check
        injection_patterns = [
            r"(?i)(system|user|assistant)\s*:\s*",
            r"(?i)\b(inject|prompt|ignore)\s*(instructed)?\s*(instructions?)?\b",
            r"(?i)\b(act as|you are|pretend|disregard)\b",
        ]
        injection_risk = False
        for p in injection_patterns:
            if re.search(p, content, re.IGNORECASE):
                injection_risk = True

        is_valid = len(redactions) == 0 and not injection_risk

        result = {
            "valid": is_valid,
            "doc_type": doc_type,
            "content_length": len(content),
            "pii_redacted": bool(redactions),
            "redactions": redactions,
            "injection_risk": injection_risk,
            "anonymized_content": content,
            "risk_level": "HIGH" if injection_risk else ("MEDIUM" if redactions else "LOW"),
        }
        return [
            types.TextContent(
                type="text",
                text=json.dumps(result, indent=2, ensure_ascii=False),
            )
        ]

    if name == "belentani_anonymize":
        text = arguments.get("text", "")
        redactions = []
        for pattern, replacement in PII_PATTERNS:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                redactions.extend(matches)
                text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)

        result = {
            "anonymized_text": text,
            "redactions_count": len(redactions),
            "redactions": redactions,
        }
        return [
            types.TextContent(
                type="text",
                text=json.dumps(result, indent=2, ensure_ascii=False),
            )
        ]

    return [
        types.TextContent(
            type="text",
            text=f"Unknown tool: {name}",
        )
    ]


def main():
    """Entry point for MCP server."""
    import asyncio

    # Use stdio transport for local development
    from mcp.server.stdio import stdio_server

    async def run():
        async with stdio_server(server) as (read_stream, write_stream):
            await server.run(
                read_stream,
                write_stream,
                InitializationOptions(
                    server=server,
                    notification_options=NotificationOptions(),
                ),
            )

    asyncio.run(run())


if __name__ == "__main__":
    import json

    main()
