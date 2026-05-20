export default function AboutPage({ dark }) {
  const card = {
    background: dark ? "#0f0f23" : "#ffffff",
    border: dark ? "1px solid #ffffff10" : "1px solid #e2e8f0",
    borderRadius: 16, padding: 24, marginBottom: 20,
  };
  const h2 = { fontSize: 18, fontWeight: 700, marginBottom: 12, color: "#6366f1" };
  const p  = { fontSize: 14, lineHeight: 1.8, color: dark ? "#aaa" : "#555" };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 0 60px" }}>

      <div style={{ textAlign:"center", marginBottom:40 }}>
        <div style={{ fontSize:13, letterSpacing:4, color:"#6366f1", textTransform:"uppercase", marginBottom:10 }}>
          ◆ Research Overview
        </div>
        <h1 style={{
          fontFamily:"'Syne',sans-serif", fontWeight:900, fontSize:36,
          background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          marginBottom:12,
        }}>
          About This Project
        </h1>
        <p style={{ color: dark ? "#555" : "#888", fontSize:15 }}>
          A deep-dive into how this sentiment analyzer works, why it was built, and what powers it.
        </p>
      </div>

      <div style={card}>
        <h2 style={h2}>🎯 Project Overview</h2>
        <p style={p}>
          This Sentiment Analyzer is a full-stack AI-powered web application that detects emotions and sentiment
          from multiple input sources including plain text, web pages, Twitter profiles, voice recordings,
          and batch file uploads. It goes beyond simple positive/negative classification by providing
          a granular breakdown of 7 human emotions with confidence scores.
        </p>
      </div>

      <div style={card}>
        <h2 style={h2}>🧠 The AI Model</h2>
        <p style={p}>
          The core of this application uses <strong style={{ color:"#8b5cf6" }}>j-hartmann/emotion-english-distilroberta-base</strong>,
          a fine-tuned transformer model hosted on HuggingFace. It is based on DistilRoBERTa —
          a distilled version of RoBERTa which itself builds on BERT architecture.
          The model was trained on a dataset of ~6 emotion categories and achieves
          state-of-the-art performance on emotion classification tasks.
          It detects: Joy, Surprise, Anger, Disgust, Fear, Sadness, and Neutral.
        </p>
      </div>

      <div style={card}>
        <h2 style={h2}>🔬 Methodology</h2>
        <p style={p}>
          Input text is tokenized and passed through the transformer model which produces
          probability scores for each emotion class. These raw scores are normalized to percentages.
          Positive sentiment is computed as Joy + Surprise, Negative as Anger + Disgust + Fear + Sadness,
          and Neutral is the remainder. The highest scoring individual emotion becomes the "top emotion".
          For voice input, OpenAI's Whisper model first transcribes speech to text before analysis.
          For URLs, BeautifulSoup scrapes visible text content. For batch analysis, each text
          is analyzed independently and results are aggregated.
        </p>
      </div>

      <div style={card}>
        <h2 style={h2}>🛠️ Tech Stack</h2>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginTop:8 }}>
          {[
            { label:"Backend", value:"Python + FastAPI" },
            { label:"Frontend", value:"React + Vite" },
            { label:"AI Model", value:"HuggingFace Transformers" },
            { label:"Speech-to-Text", value:"OpenAI Whisper" },
            { label:"Web Scraping", value:"BeautifulSoup + HTTPX" },
            { label:"Styling", value:"CSS-in-JS (inline)" },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: dark ? "#ffffff06" : "#f8fafc",
              borderRadius:10, padding:"12px 16px",
            }}>
              <div style={{ fontSize:11, color:"#6366f1", letterSpacing:2, textTransform:"uppercase" }}>{label}</div>
              <div style={{ fontSize:14, fontWeight:600, marginTop:4, color: dark ? "#e2e8f0" : "#1a1a2e" }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={card}>
        <h2 style={h2}>📊 Input Sources</h2>
        {[
          { icon:"✏️", title:"Text", desc:"Direct text input analyzed in real-time. Supports up to 512 tokens per analysis." },
          { icon:"🎙️", title:"Voice", desc:"Records audio via microphone, transcribes using Whisper, then runs sentiment analysis on the transcript." },
          { icon:"🌐", title:"URL", desc:"Fetches and scrapes any public webpage, strips HTML noise, and analyzes the visible text content." },
          { icon:"𝕏",  title:"Twitter", desc:"Analyzes recent tweets from any public profile. Uses demo mode without API keys, or live data with a Bearer Token." },
          { icon:"📁", title:"File Upload", desc:"Upload a .txt or .csv file with multiple texts for batch analysis. Results shown per-entry with aggregated summary." },
        ].map(({ icon, title, desc }) => (
          <div key={title} style={{ display:"flex", gap:14, marginBottom:16 }}>
            <div style={{ fontSize:24, minWidth:36 }}>{icon}</div>
            <div>
              <div style={{ fontWeight:700, marginBottom:4, color: dark ? "#e2e8f0" : "#1a1a2e" }}>{title}</div>
              <div style={{ fontSize:13, color: dark ? "#888" : "#666", lineHeight:1.6 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={card}>
        <h2 style={h2}>⚠️ Limitations</h2>
        <p style={p}>
          The model works best with English text. Non-English inputs may produce inaccurate results.
          Very short texts (under 5 words) may not have enough context for reliable classification.
          Twitter analysis uses demo data unless a Bearer Token is configured.
          Voice transcription accuracy depends on microphone quality and background noise.
          URL scraping may not work on pages requiring login or JavaScript rendering.
        </p>
      </div>

      <div style={card}>
        <h2 style={h2}>👨‍💻 Built By</h2>
        <p style={p}>
          This project was built as a demonstration of modern full-stack AI application development,
          combining state-of-the-art NLP models with a clean, interactive user interface.
          The goal was to make emotion AI accessible, explainable, and useful across multiple real-world input types.
        </p>
      </div>

    </div>
  );
}