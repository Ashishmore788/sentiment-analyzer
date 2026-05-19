const BASE = "http://localhost:8000";

export async function analyzeText(text) {
  const res = await fetch(`${BASE}/analyze/text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Failed");
  return res.json();
}

export async function analyzeUrl(url) {
  const res = await fetch(`${BASE}/analyze/url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Failed");
  return res.json();
}

export async function analyzeTwitter(username, tweet_count = 5) {
  const res = await fetch(`${BASE}/analyze/twitter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, tweet_count }),
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Failed");
  return res.json();
}