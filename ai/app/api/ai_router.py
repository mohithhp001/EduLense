from fastapi import APIRouter, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional
from app.services.ollama_client import ollama_generate

router = APIRouter(prefix="/api/ai", tags=["ai"])

class IngestRequest(BaseModel):
    url: Optional[str] = None
    text: Optional[str] = None

class IngestResponse(BaseModel):
    content_id: str
    message: str

class TopicRequest(BaseModel):
    content_id: str

class TopicResponse(BaseModel):
    topics: List[str]

class QARequest(BaseModel):
    content_id: str
    question: str

class QAResponse(BaseModel):
    answer: str

class FlashcardRequest(BaseModel):
    content_id: str
    topic: Optional[str] = None

class FlashcardResponse(BaseModel):
    flashcards: List[str]

class SummarizeRequest(BaseModel):
    content_id: str
    topic: Optional[str] = None

class SummarizeResponse(BaseModel):
    summary: str

@router.post("/ingest", response_model=IngestResponse)
async def ingest_content(
    file: UploadFile = File(None),
    url: str = Form(None),
    text: str = Form(None)
):
    # Stub: Save file, fetch url, or use text
    # Return a fake content_id
    return IngestResponse(content_id="content123", message="Content ingested (stub)")

@router.post("/topics", response_model=TopicResponse)
async def extract_topics(req: TopicRequest):
    # Stub: Return fake topics
    return TopicResponse(topics=["Topic 1", "Topic 2", "Topic 3"])

@router.post("/qa", response_model=QAResponse)
async def answer_question(req: QARequest):
    # Use Ollama to answer the question (real LLM call)
    prompt = f"Answer the following question based on the user's uploaded content (content_id: {req.content_id}): {req.question}"
    answer = await ollama_generate(prompt)
    return QAResponse(answer=answer)

@router.post("/flashcards", response_model=FlashcardResponse)
async def generate_flashcards(req: FlashcardRequest):
    # Stub: Return fake flashcards
    return FlashcardResponse(flashcards=["Flashcard 1", "Flashcard 2"])

@router.post("/summarize", response_model=SummarizeResponse)
async def summarize_content(req: SummarizeRequest):
    # Stub: Return a fake summary
    return SummarizeResponse(summary="This is a stub summary.") 