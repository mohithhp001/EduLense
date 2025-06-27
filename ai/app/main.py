from fastapi import FastAPI
import logging
from app.api.ai_router import router as ai_router

logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s in %(module)s: %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="EduLense AI Service", version="0.1.0")

app.include_router(ai_router)

@app.get("/api/ai/health")
def health():
    logger.info("AI health check endpoint called.")
    return {"status": "ok"} 