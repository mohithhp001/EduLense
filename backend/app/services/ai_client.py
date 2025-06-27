import httpx
from typing import Optional, Dict, Any

AI_BASE_URL = "http://ai:8001/api/ai"

async def ai_ingest(file: Optional[bytes] = None, filename: Optional[str] = None, url: Optional[str] = None, text: Optional[str] = None) -> Dict[str, Any]:
    async with httpx.AsyncClient() as client:
        data = {}
        files = None
        if file and filename:
            files = {"file": (filename, file)}
        if url:
            data["url"] = url
        if text:
            data["text"] = text
        resp = await client.post(f"{AI_BASE_URL}/ingest", data=data, files=files)
        resp.raise_for_status()
        return resp.json()

async def ai_topics(content_id: str) -> Dict[str, Any]:
    async with httpx.AsyncClient() as client:
        resp = await client.post(f"{AI_BASE_URL}/topics", json={"content_id": content_id})
        resp.raise_for_status()
        return resp.json()

async def ai_qa(content_id: str, question: str) -> Dict[str, Any]:
    async with httpx.AsyncClient() as client:
        resp = await client.post(f"{AI_BASE_URL}/qa", json={"content_id": content_id, "question": question})
        resp.raise_for_status()
        return resp.json()

async def ai_flashcards(content_id: str, topic: Optional[str] = None) -> Dict[str, Any]:
    async with httpx.AsyncClient() as client:
        payload = {"content_id": content_id}
        if topic:
            payload["topic"] = topic
        resp = await client.post(f"{AI_BASE_URL}/flashcards", json=payload)
        resp.raise_for_status()
        return resp.json()

async def ai_summarize(content_id: str, topic: Optional[str] = None) -> Dict[str, Any]:
    async with httpx.AsyncClient() as client:
        payload = {"content_id": content_id}
        if topic:
            payload["topic"] = topic
        resp = await client.post(f"{AI_BASE_URL}/summarize", json=payload)
        resp.raise_for_status()
        return resp.json() 