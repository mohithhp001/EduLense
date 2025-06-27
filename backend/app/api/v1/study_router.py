from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.ai_client import ai_ingest, ai_qa
from typing import Optional

router = APIRouter(prefix="/api/study", tags=["study"])

@router.post("/ingest")
async def ingest(file: Optional[UploadFile] = File(None), url: Optional[str] = Form(None), text: Optional[str] = Form(None)):
    try:
        file_bytes = await file.read() if file else None
        filename = file.filename if file else None
        result = await ai_ingest(file=file_bytes, filename=filename, url=url, text=text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/qa")
async def qa(content_id: str = Form(...), question: str = Form(...)):
    try:
        result = await ai_qa(content_id=content_id, question=question)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 