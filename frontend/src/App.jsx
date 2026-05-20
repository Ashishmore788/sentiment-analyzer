import { useState } from "react";
import { analyzeText, analyzeUrl, analyzeTwitter, analyzeVoice, analyzeBatch } from "./api/sentiment";
import { useVoiceRecorder } from "./hooks/useVoiceRecorder";
import ResultCard from "./components/ResultCard";
import AboutPage from "./components/AboutPage";

const TABS = [
  { id:"text",    label:"Text",    icon:"✏️" },
  { id:"voice",   label:"Voice",   icon:"🎙️" },
  { id:"url",     label:"URL",     icon:"🌐" },
  { id:"twitter", label:"Twitter", icon:"𝕏"  },
  { id:"file",    label:"File",    icon:"📁" },
];

const NAV = [
  { id:"app",   label:"Analyzer" },
  { id:"about", label:"About"    },
  { id:"history",label:"History" },
];

export default function App() {
  const [page, setPage]       = useState("app");
  const [dark, setDark]       = useState(true);
  const [tab, setTab]         = useState("text");
  const [text, setText]       = useState("");
  const [url, setUrl]         = useState("");
  const [username, setUsername] = useState("");
  const [result, setResult]   = useState(null);
  const [batchResults, setBatchResults] = useState(null);
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("sentiment_history") || "[]"); }
    catch { return []; }
  });

  const { isRecording, audioBlob, startRecording, stopRecording, reset } = useVoiceRecorder();

  const bg   = dark ? "#07071a" : "#f0f4ff";
  const fg   = dark ? "#e2e8f0" : "#1a1a2e";

  const saveToHistory = (r) => {
    const entry = { ...r, timestamp: new Date().toLocaleString(), id: Date.now() };
    const updated = [entry, ...history].slice(0, 20);
    setHistory(updated);
    localStorage.setItem("sentiment_history", JSON.stringify(updated));
  };

  const run = async () => {
    setLoading(true); setError(null); setResult(null); setBatchResults(null);
    try {
      let data;
      if (tab === "text")    data = await analyzeText(text);
      if (tab === "url")     data = await analyzeUrl(url);
      if (tab === "twitter") data = await analyzeTwitter(username);
      if (tab === "voice" && audioBlob) { data = await analyzeVoice(audioBlob); reset(); }
      if (data) { setResult(data); saveToHistory(data); }
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true); setError(null); setResult(null); setBatchResults(null);
    try {
      const text = await file.text();
      let texts = [];
      if (file.name.endsWith(".csv")) {
        texts = text.split("\n").map(l => l.replace(/^"|"$/g,"").trim()).filter(Boolean);
      } else {
        texts = text.split("\n").filter(l => l.trim().length > 3);
      }
      const data = await analyzeBatch(texts.slice(0,50));
      setBatchResults(data.results);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const inputStyle = {
    width:"100%", background: dark ? "#0f0f23" : "#ffffff",
    border: dark ? "1px solid #ffffff15" : "1px solid #e2e8f0",
    borderRadius:12, color: fg, padding:"14px 16px",
    fontSize:15, outline:"none", fontFamily:"inherit", boxSizing:"border-box",
  };

  const btnStyle = {
    marginTop:16, padding:"13px 28px", width:"100%",
    background: loading ? (dark ? "#2d2d50" : "#e2e8f0") : "linear-gradient(135deg,#6366f1,#8b5cf6)",
    color: loading ? "#888" : "#fff", border:"none", borderRadius:10,
    fontSize:15, fontWeight:700, cursor: loading ? "not-allowed" : "pointer",
    fontFamily:"inherit", boxShadow: loading ? "none" : "0 4px 20px #6366f155",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;900&family=DM+Sans:wght@400;600&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background:${bg}; color:${fg}; font-family:'DM Sans',sans-serif; min-height:100vh; transition:background 0.3s; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{box-shadow:0 0 20px #ef444466} 50%{box-shadow:0 0 40px #ef4444aa} }
      `}</style>

      {/* Navbar */}
      <div style={{
        position:"sticky", top:0, zIndex:100,
        background: dark ? "#07071acc" : "#f0f4ffcc",
        backdropFilter:"blur(12px)",
        borderBottom: dark ? "1px solid #ffffff10" : "1px solid #e2e8f0",
        padding:"12px 24px", display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:900, fontSize:20,
          background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
          🧠 SentimentAI
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)} style={{
              padding:"7px 16px", borderRadius:8, border:"none",
              background: page===n.id ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "transparent",
              color: page===n.id ? "#fff" : (dark ? "#555" : "#888"),
              cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:"inherit",
            }}>{n.label}</button>
          ))}
          <button onClick={() => setDark(!dark)} style={{
            padding:"7px 12px", borderRadius:8, border:"none",
            background: dark ? "#ffffff10" : "#00000010",
            cursor:"pointer", fontSize:16,
          }}>{dark ? "☀️" : "🌙"}</button>
        </div>
      </div>

      <div style={{ maxWidth:680, margin:"0 auto", padding:"40px 24px 80px" }}>

        {/* About Page */}
        {page === "about" && <AboutPage dark={dark} />}

        {/* History Page */}
        {page === "history" && (
          <div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:900, fontSize:28, marginBottom:24,
              background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              Analysis History
            </h2>
            {history.length === 0 && (
              <div style={{ textAlign:"center", color:"#555", marginTop:60, fontSize:15 }}>
                No history yet — run some analyses first!
              </div>
            )}
            {history.map((h) => (
              <div key={h.id} style={{
                background: dark ? "#0f0f23" : "#ffffff",
                border: dark ? "1px solid #ffffff10" : "1px solid #e2e8f0",
                borderRadius:14, padding:"16px 20px", marginBottom:12,
                display:"flex", alignItems:"center", justifyContent:"space-between",
              }}>
                <div>
                  <div style={{ fontSize:11, color:"#555", marginBottom:4 }}>{h.timestamp} · {h.source}</div>
                  <div style={{ fontWeight:700, color:
                    h.overall==="Positive"?"#10b981":h.overall==="Negative"?"#ef4444":"#6b7280" }}>
                    {h.overall} — {h.top_emotion} {
                      h.overall==="Positive"?"😄":h.overall==="Negative"?"😞":"😐"
                    }
                  </div>
                  <div style={{ fontSize:12, color:"#888", marginTop:2 }}>{h.text_snippet || h.transcription || h.page_title || ""}</div>
                </div>
                <div style={{ fontSize:22, fontWeight:900, color:
                  h.overall==="Positive"?"#10b981":h.overall==="Negative"?"#ef4444":"#6b7280" }}>
                  {h.confidence}%
                </div>
              </div>
            ))}
            {history.length > 0 && (
              <button onClick={() => { setHistory([]); localStorage.removeItem("sentiment_history"); }} style={{
                marginTop:16, padding:"10px 20px", background:"#ef444422",
                border:"1px solid #ef444444", borderRadius:10,
                color:"#ef4444", cursor:"pointer", fontSize:13, fontFamily:"inherit",
              }}>
                🗑️ Clear History
              </button>
            )}
          </div>
        )}

        {/* Main Analyzer */}
        {page === "app" && (
          <>
            <div style={{ textAlign:"center", marginBottom:40 }}>
              <div style={{ fontSize:13, letterSpacing:4, color:"#6366f1", textTransform:"uppercase", marginBottom:10 }}>
                ◆ Emotion Intelligence
              </div>
              <h1 style={{
                fontFamily:"'Syne',sans-serif", fontWeight:900,
                fontSize:"clamp(36px,6vw,54px)", lineHeight:1.1, marginBottom:12,
                background:"linear-gradient(135deg,#fff,#a5b4fc,#818cf8)",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
              }}>
                Sentiment<br/>Analyzer
              </h1>
              <p style={{ color: dark ? "#555" : "#888", fontSize:15 }}>
                Decode emotions from text, voice, URLs, Twitter, or files.
              </p>
            </div>

            {/* Tabs */}
            <div style={{
              display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:6, marginBottom:24,
              background: dark ? "#0f0f23" : "#ffffff",
              borderRadius:14, padding:6,
              border: dark ? "1px solid #ffffff10" : "1px solid #e2e8f0",
            }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => { setTab(t.id); setResult(null); setError(null); setBatchResults(null); }} style={{
                  padding:"10px 4px", borderRadius:10, border:"none",
                  background: tab===t.id ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "transparent",
                  color: tab===t.id ? "#fff" : (dark ? "#555" : "#aaa"),
                  cursor:"pointer", fontSize:12, fontWeight:600, fontFamily:"inherit",
                }}>
                  <div style={{ fontSize:18, marginBottom:3 }}>{t.icon}</div>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Input Card */}
            <div style={{
              background: dark ? "linear-gradient(135deg,#0f0f23,#1a1a3e)" : "#ffffff",
              border: dark ? "1px solid #ffffff10" : "1px solid #e2e8f0",
              borderRadius:20, padding:28,
            }}>
              {tab === "text" && (
                <textarea value={text} onChange={e => setText(e.target.value)}
                  placeholder="Paste any text — a review, email, article, comment…"
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
              {tab === "voice" && (
                <div style={{ textAlign:"center", padding:"20px 0" }}>
                  <div style={{
                    width:90, height:90, borderRadius:"50%", margin:"0 auto 20px",
                    background: isRecording ? "#ef444422" : "#6366f122",
                    border:`2px solid ${isRecording ? "#ef4444" : "#6366f1"}`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:36, cursor:"pointer",
                    animation: isRecording ? "pulse 1.5s infinite" : "none",
                  }} onClick={isRecording ? stopRecording : startRecording}>
                    {isRecording ? "⏹" : "🎙️"}
                  </div>
                  <div style={{ color:"#888", fontSize:14 }}>
                    {isRecording ? "Recording… click to stop" : audioBlob ? "Ready to analyze!" : "Click mic to start recording"}
                  </div>
                </div>
              )}
              {tab === "file" && (
                <div style={{ textAlign:"center", padding:"20px 0" }}>
                  <label style={{
                    display:"block", padding:"30px", border:`2px dashed ${dark?"#ffffff20":"#e2e8f0"}`,
                    borderRadius:14, cursor:"pointer", color:"#888", fontSize:14,
                  }}>
                    📁 Click to upload .txt or .csv file
                    <input type="file" accept=".txt,.csv" onChange={handleFile} style={{ display:"none" }} />
                  </label>
                  <div style={{ fontSize:12, color:"#555", marginTop:10 }}>
                    Each line = one text entry. Max 50 entries.
                  </div>
                </div>
              )}

              {tab !== "file" && !(tab === "voice" && !audioBlob && !isRecording) && (
                <button onClick={run} disabled={loading} style={btnStyle}>
                  {loading ? "Analyzing…" : "Analyze Sentiment →"}
                </button>
              )}
              {tab === "voice" && audioBlob && (
                <button onClick={run} disabled={loading} style={btnStyle}>
                  {loading ? "Transcribing & Analyzing…" : "Analyze Recording →"}
                </button>
              )}
            </div>

            {/* Error */}
            {error && (
              <div style={{
                marginTop:16, padding:"12px 18px", background:"#ef444411",
                border:"1px solid #ef444444", borderRadius:10, color:"#ef4444", fontSize:14,
              }}>⚠️ {error}</div>
            )}

            {/* Single Result */}
            <ResultCard result={result} dark={dark} />

            {/* Batch Results */}
            {batchResults && (
              <div style={{ marginTop:24 }}>
                <h3 style={{ marginBottom:16, fontSize:16, fontWeight:700, color:"#6366f1" }}>
                  📊 Batch Results ({batchResults.length} entries)
                </h3>
                {batchResults.map((r, i) => (
                  <div key={i} style={{
                    background: dark ? "#0f0f23" : "#ffffff",
                    border: dark ? "1px solid #ffffff10" : "1px solid #e2e8f0",
                    borderRadius:12, padding:"14px 18px", marginBottom:10,
                    display:"flex", alignItems:"center", justifyContent:"space-between",
                  }}>
                    <div>
                      <div style={{ fontSize:12, color:"#888", marginBottom:4 }}>Entry {i+1}</div>
                      <div style={{ fontSize:13, color: dark?"#ccc":"#333", lineHeight:1.5 }}>{r.text_snippet}</div>
                    </div>
                    <div style={{ textAlign:"right", minWidth:100, marginLeft:16 }}>
                      <div style={{ fontWeight:700, color:
                        r.overall==="Positive"?"#10b981":r.overall==="Negative"?"#ef4444":"#6b7280" }}>
                        {r.overall}
                      </div>
                      <div style={{ fontSize:12, color:"#888" }}>{r.confidence}%</div>
                      <div style={{ fontSize:18 }}>{
                        r.overall==="Positive"?"😄":r.overall==="Negative"?"😞":"😐"
                      }</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}