import { useState } from "react";
import { analyzeText, analyzeUrl, analyzeTwitter } from "./api/sentiment";

const EMOTION_META = {
  joy:      { emoji: "😄", color: "#f59e0b" },
  surprise: { emoji: "😲", color: "#8b5cf6" },
  anger:    { emoji: "😠", color: "#ef4444" },
  disgust:  { emoji: "🤢", color: "#84cc16" },
  fear:     { emoji: "😨", color: "#6366f1" },
  sadness:  { emoji: "😢", color: "#3b82f6" },
  neutral:  { emoji: "😐", color: "#6b7280" },
};

const OVERALL_META = {
  Positive: { color: "#10b981", icon: "↑" },
  Negative: { color: "#ef4444", icon: "↓" },
  Neutral:  { color: "#6b7280", icon: "→" },
};

const TABS = [
  { id: "text",    label: "Text",    icon: "✏️" },
  { id: "url",     label: "URL",     icon: "🌐" },
  { id: "twitter", label: "Twitter", icon: "𝕏"  },
];

function EmotionBar({ emotion, score }) {
  const meta = EMOTION_META[emotion] || { emoji: "❓", color: "#999" };
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5, fontSize:13 }}>
        <span>{meta.emoji} {emotion}</span>
        <span style={{ color: meta.color, fontWeight: 700 }}>{score}%</span>
      </div>
      <div style={{ background:"#1a1a2e", borderRadius:6, height:8, overflow:"hidden" }}>
        <div style={{
          width:`${score}%`, height:"100%", background: meta.color,
          borderRadius:6, transition:"width 1s ease",
          boxShadow:`0 0 8px ${meta.color}88`,
        }}/>
      </div>
    </div>
  );
}

function ResultCard({ result }) {
  if (!result) return null;
  const overall = OVERALL_META[result.overall] || OVERALL_META.Neutral;
  const sortedEmotions = Object.entries(result.emotions || {}).sort((a,b) => b[1]-a[1]);
  return (
    <div style={{
      background:"linear-gradient(135deg,#0f0f23,#1a1a3e)",
      border:`1px solid ${overall.color}44`, borderRadius:20,
      padding:28, marginTop:24,
      boxShadow:`0 0 40px ${overall.color}33`,
      animation:"fadeIn 0.5s ease",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:24 }}>
        <div style={{
          width:70, height:70, borderRadius:"50%",
          background:`${overall.color}22`, border:`2px solid ${overall.color}`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:28,
        }}>
          {overall.icon}
        </div>
        <div>
          <div style={{ fontSize:11, letterSpacing:3, color:"#666", textTransform:"uppercase" }}>Overall Sentiment</div>
          <div style={{ fontSize:30, fontWeight:900, color:overall.color }}>{result.overall}</div>
          <div style={{ fontSize:13, color:"#888" }}>{result.confidence}% confidence</div>
        </div>
        <div style={{ marginLeft:"auto", textAlign:"right" }}>
          <div style={{ fontSize:11, color:"#555", letterSpacing:2, textTransform:"uppercase" }}>Top Emotion</div>
          <div style={{ fontSize:20, marginTop:4 }}>
            {EMOTION_META[result.top_emotion]?.emoji}{" "}
            <span style={{ color: EMOTION_META[result.top_emotion]?.color, fontWeight:700 }}>
              {result.top_emotion}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:28 }}>
        {[
          { label:"Positive", value:result.scores?.positive, color:"#10b981" },
          { label:"Negative", value:result.scores?.negative, color:"#ef4444" },
          { label:"Neutral",  value:result.scores?.neutral,  color:"#6b7280" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background:`${color}11`, border:`1px solid ${color}33`,
            borderRadius:12, padding:"14px 10px", textAlign:"center",
          }}>
            <div style={{ fontSize:24, fontWeight:900, color }}>{value}%</div>
            <div style={{ fontSize:11, color:"#666", marginTop:2 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:11, letterSpacing:3, color:"#555", textTransform:"uppercase", marginBottom:14 }}>
          Emotion Breakdown
        </div>
        {sortedEmotions.map(([emotion, score]) => (
          <EmotionBar key={emotion} emotion={emotion} score={score} />
        ))}
      </div>

      {result.text_snippet && (
        <div style={{
          background:"#ffffff08", border:"1px solid #ffffff10",
          borderRadius:10, padding:14, fontSize:13, color:"#888",
          fontStyle:"italic", lineHeight:1.6,
        }}>
          "{result.text_snippet}"
        </div>
      )}
      {result.page_title && (
        <div style={{ marginTop:12, fontSize:12, color:"#555" }}>
          📄 <span style={{ color:"#8b5cf6" }}>{result.page_title}</span>
        </div>
      )}
      {result.tweets && (
        <div style={{ marginTop:16 }}>
          <div style={{ fontSize:11, color:"#555", letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>
            Tweets Analyzed {result.demo_mode && <span style={{ color:"#f59e0b" }}>(demo)</span>}
          </div>
          {result.tweets.slice(0,3).map((t,i) => (
            <div key={i} style={{
              background:"#ffffff06", borderRadius:8, padding:"8px 12px",
              marginBottom:8, fontSize:13, color:"#aaa", lineHeight:1.5,
            }}>{t}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [tab, setTab]       = useState("text");
  const [text, setText]     = useState("");
  const [url, setUrl]       = useState("");
  const [username, setUsername] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError]   = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      let data;
      if (tab === "text")    data = await analyzeText(text);
      if (tab === "url")     data = await analyzeUrl(url);
      if (tab === "twitter") data = await analyzeTwitter(username);
      setResult(data);
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width:"100%", background:"#0f0f23", border:"1px solid #ffffff15",
    borderRadius:12, color:"#e2e8f0", padding:"14px 16px",
    fontSize:15, outline:"none", fontFamily:"inherit", boxSizing:"border-box",
  };

  const btnStyle = {
    marginTop:16, padding:"13px 28px", width:"100%",
    background: loading ? "#2d2d50" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
    color:"#fff", border:"none", borderRadius:10,
    fontSize:15, fontWeight:700, cursor: loading ? "not-allowed" : "pointer",
    fontFamily:"inherit", boxShadow: loading ? "none" : "0 4px 20px #6366f155",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;900&family=DM+Sans:wght@400;600&display=swap');
        @keyframes fadeIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div style={{ maxWidth:680, margin:"0 auto", padding:"48px 24px 80px" }}>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <div style={{ fontSize:13, letterSpacing:4, color:"#6366f1", textTransform:"uppercase", marginBottom:12 }}>
            ◆ Emotion Intelligence
          </div>
          <h1 style={{
            fontFamily:"'Syne',sans-serif", fontWeight:900,
            fontSize:"clamp(36px,6vw,54px)", lineHeight:1.1, marginBottom:14,
            background:"linear-gradient(135deg,#fff,#a5b4fc,#818cf8)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          }}>
            Sentiment<br/>Analyzer
          </h1>
          <p style={{ color:"#555", fontSize:15 }}>
            Decode emotions from text, URLs, or Twitter profiles.
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:28,
          background:"#0f0f23", borderRadius:14, padding:6, border:"1px solid #ffffff10",
        }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setResult(null); setError(null); }} style={{
              padding:"10px 6px", borderRadius:10, border:"none",
              background: tab===t.id ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "transparent",
              color: tab===t.id ? "#fff" : "#555",
              cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:"inherit",
            }}>
              <div style={{ fontSize:20, marginBottom:4 }}>{t.icon}</div>
              {t.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div style={{
          background:"linear-gradient(135deg,#0f0f23,#1a1a3e)",
          border:"1px solid #ffffff10", borderRadius:20, padding:28,
        }}>
          {tab === "text" && (
            <textarea value={text} onChange={e => setText(e.target.value)}
              placeholder="Paste any text here — a review, email, article…"
              style={{ ...inputStyle, minHeight:140, resize:"vertical", lineHeight:1.7 }}
            />
          )}
          {tab === "url" && (
            <input value={url} onChange={e => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              onKeyDown={e => e.key==="Enter" && run()}
              style={inputStyle}
            />
          )}
          {tab === "twitter" && (
            <input value={username} onChange={e => setUsername(e.target.value)}
              placeholder="@username"
              onKeyDown={e => e.key==="Enter" && run()}
              style={inputStyle}
            />
          )}
          <button onClick={run} disabled={loading} style={btnStyle}>
            {loading ? "Analyzing…" : "Analyze Sentiment →"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginTop:16, padding:"12px 18px", background:"#ef444411",
            border:"1px solid #ef444444", borderRadius:10, color:"#ef4444", fontSize:14,
          }}>
            ⚠️ {error}
          </div>
        )}

        <ResultCard result={result} />
      </div>
    </>
  );
}