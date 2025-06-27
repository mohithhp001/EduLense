import httpx

OLLAMA_URL = "http://host.docker.internal:11434/api/generate"

async def ollama_generate(prompt: str, model: str = "mistral") -> str:
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False
    }
    async with httpx.AsyncClient() as client:
        resp = await client.post(OLLAMA_URL, json=payload)
        resp.raise_for_status()
        return resp.json()["response"] 