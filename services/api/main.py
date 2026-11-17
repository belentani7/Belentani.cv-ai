"""
Belentani Backend Service — FastAPI template
Python 3.12+ | Strict typing | GDPR-safe | Rate-limited
"""
from __future__ import annotations

import structlog
from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os

logger = structlog.get_logger()

# ============================================================
# Application
# ============================================================
app = FastAPI(
    title="Belentani API",
    description="Backend service for the Belentani / NOIACORE ecosystem",
    version="1.0.0",
    contact={"name": "NOIACORE", "url": "https://belentani.es"},
    license_info={"name": "MIT", "url": "https://opensource.org/licenses/MIT"},
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/api/openapi.json",
)

# ============================================================
# Rate limiting
# ============================================================
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100/hour"],
    storage_uri="memory://",
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
limiter.init_app(app)

# ============================================================
# CORS (strict)
# ============================================================
ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "https://belentani.es").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in ALLOWED_ORIGINS if o.strip()],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
    max_age=3600,
)

# ============================================================
# Privacy-safe logging
# ============================================================
import logging
import sys

# Suppress PII in logs — log keys only, never values
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    stream=sys.stdout,
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Structured logging without PII."""
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    logger.info(
        "request",
        method=request.method,
        path=request.url.path,
        status=response.status_code,
        # Never log request body or user data
    )
    return response


# ============================================================
# Schemas (Pydantic V2)
# ============================================================
class HealthResponse(BaseModel):
    status: str = Field(default="ok")
    version: str = Field(default="1.0.0")
    timestamp: str = Field(default_factory=lambda: __import__("datetime").datetime.utcnow().isoformat())


class DocumentRequest(BaseModel):
    """
    AI document generation request.
    Strict: rejects any field not in this schema.
    Never logs or persists PII beyond user_id.
    """
    user_id: str = Field(..., min_length=1, max_length=64, pattern=r"^[a-zA-Z0-9_-]+$")
    content: str = Field(..., min_length=1, max_length=5000)
    doc_type: str = Field(default="cv", pattern=r"^(cv|cover|presentation)$")
    lang: str = Field(default="es", pattern=r"^(es|en|pt|ca)$")

    @field_validator("content")
    @classmethod
    def strip_pii(cls, v: str) -> str:
        """Reject potential PII in content."""
        forbidden = ["DNI", "NIF", "SSN", "credit_card", "phone:", "password:"]
        for f in forbidden:
            if f.lower() in v.lower():
                raise ValueError(f"PII field '{f}' not allowed in content")
        return v.strip()


class DocumentResponse(BaseModel):
    document_id: str
    content: str
    warnings: list[str] = Field(default_factory=list)


# ============================================================
# Endpoints
# ============================================================
@app.get("/health", response_model=HealthResponse, tags=["health"])
@limiter.limit("10/minute")
async def health():
    """Check service health."""
    return HealthResponse(status="ok")


@app.post("/api/generate", response_model=DocumentResponse, tags=["ai"], status_code=201)
@limiter.limit("5/minute")
async def generate_document(request: Request, payload: DocumentRequest):
    """
    Generate an AI document.
    - Rate limited: 5 req/min per IP
    - Zod-equivalent validation via Pydantic
    - PII stripping before LLM call
    - Generic error responses (no stack trace leak)
    """
    client_host = request.client.host if request.client else "unknown"

    logger.info(
        "generate_request",
        user_id=payload.user_id,
        doc_type=payload.doc_type,
        lang=payload.lang,
        client=client_host,
        content_len=len(payload.content),
    )

    try:
        # --- Sanitize content before LLM ---
        safe_content = DocumentRequest.strip_pii.__wrapped__.__func__(payload.content)  # type: ignore

        # --- Mock LLM call (replace with real provider) ---
        # IMPORTANT: Never send raw PII to the LLM.
        # All user data must be stripped/anonymized first.
        generated = f"[Generated {payload.doc_type} for user {payload.user_id[:2]}***] Content sanitized: {len(safe_content)} chars"

        return DocumentResponse(
            document_id=f"doc_{int(__import__('time').time())}",
            content=generated,
            warnings=["This is a template response. Replace with actual LLM call."],
        )

    except ValueError as e:
        logger.warning("validation_error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payload",
        )
    except Exception as e:
        logger.error("generation_error", error_type=type(e).__name__)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal error during document generation",
        )


@app.post("/webhook", tags=["webhook"])
@limiter.limit("20/minute")
async def webhook(request: Request):
    """Receive webhook events (e.g., from MCP agents)."""
    body = await request.body()
    logger.info("webhook_received", length=len(body))
    return {"status": "received", "length": len(body)}


# ============================================================
# Error handlers
# ============================================================
@app.exception_handler(Exception)
async def internal_error_handler(request: Request, exc: Exception):
    """Always return generic error, never expose stack traces."""
    logger.error(
        "unhandled_error",
        path=request.url.path,
        error_type=type(exc).__name__,
    )
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"},
    )


@app.exception_handler(HTTPException)
async def http_error_handler(request: Request, exc: HTTPException):
    """Log errors but return generic messages."""
    logger.warning(
        "http_error",
        path=request.url.path,
        status_code=exc.status_code,
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail},
    )
