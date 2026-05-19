from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_pipeline = None

def get_pipeline():
    global _pipeline
    if _pipeline is None:
        from transformers import pipeline
        _pipeline = pipeline(
            "text-classification",
            model="j-hartmann/emotion-english-distilroberta-base",
            top_k=None
        )
    return _pipeline

def analyze(text: str):
    pipe = get_pipeline()
    results = pipe(text[:512])[0]
    emotion_map = {r["label"]: round(r["score"] * 100, 1) for r in results}

    positive = sum(emotion_map.get(l, 0) for l in ["joy", "surprise"])
    negative = sum(emotion_map.get(l, 0) for l in ["anger", "disgust", "fear", "sadness"])
    neutral  = max(0, 100 - positive - negative)

    if positive >= negative and positive >= neutral:
        overall, confidence = "Positive", round(positive, 1)
    elif negative >= positive and negative >= neutral:
        overall, confidence = "Negative", round(negative, 1)
    else:
        overall, confidence = "Neutral", round(neutral, 1)

    return {
        "overall": overall,
        "confidence": confidence,
        "top_emotion": max(emotion_map, key=emotion_map.get),
        "emotions": emotion_map,
        "scores": {"positive": round(positive,1), "negative": round(negative,1), "neutral": round(neutral,1)},
        "text_snippet": text[:200] + ("..." if len(text) > 200 else ""),
    }

class TextRequest(BaseModel):
    text: str

@app.post("/analyze/text")
async def analyze_text(req: TextRequest):
    try:
        result = analyze(req.text)
        result["source"] = "text"
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class UrlRequest(BaseModel):
    url: str

@app.post("/analyze/url")
async def analyze_url(req: UrlRequest):
    import httpx
    from bs4 import BeautifulSoup
    try:
        async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
            resp = await client.get(req.url, headers={"User-Agent": "Mozilla/5.0"})
        soup = BeautifulSoup(resp.text, "html.parser")
        for tag in soup(["script","style","nav","footer"]):
            tag.decompose()
        text = " ".join(soup.get_text(separator=" ").split())
        result = analyze(text[:1500])
        result["source"] = "url"
        result["page_title"] = soup.title.string.strip() if soup.title else req.url
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class TwitterRequest(BaseModel):
    username: str
    tweet_count: Optional[int] = 5

@app.post("/analyze/twitter")
async def analyze_twitter(req: TwitterRequest):
    demo_tweets = [
        "Excited to share my latest work! Really proud of what we have built 🚀",
        "Sometimes things don't go as planned, but we keep pushing forward.",
        "Great meeting with the team today. Innovation never stops!",
        "Feeling a bit overwhelmed with all the changes lately...",
        "Just launched something amazing! Can't wait for the world to see it.",
    ][:req.tweet_count]
    result = analyze(" ".join(demo_tweets))
    result["source"] = "twitter"
    result["username"] = req.username
    result["tweets"] = demo_tweets
    result["demo_mode"] = True
    return result

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)