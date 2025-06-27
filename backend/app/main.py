from fastapi import FastAPI
from app.core.logging_config import setup_logging
import logging
from app.api.v1 import study_router

setup_logging()
logger = logging.getLogger(__name__)

app = FastAPI(title="EduLense API", version="0.1.0")

app.include_router(study_router)

@app.get("/api/health")
def health():
    logger.info("Health check endpoint called.")
    return {"status": "ok"} 