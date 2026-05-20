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

function EmotionBar({ emotion, score, dark }) {
  const meta = EMOTION_META[emotion] || { emoji: "❓", color: "#999" };
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5, fontSize:13 }}>
        <span>{meta.emoji} {emotion}</span>
        <span style={{ color: meta.color, fontWeight: 700 }}>{score}%</span>
      </div>
      <div style={{ background: dark ? "#1a1a2e" : "#e2e8f0", borderRadius:6, height:8, overflow:"hidden" }}>
        <div style={{
          width:`${score}%`, height:"100%", background: meta.color,
          borderRadius:6, transition:"width 1s ease",
          boxShadow:`0 0 8px ${meta.color}88`,
        }}/>
      </div>
    </div>
  );
}

export default function ResultCard({ result, dark }) {
  if (!result) return null;
  const overall = OVERALL_META[result.overall] || OVERALL_META.Neutral;
  const sortedEmotions = Object.entries(result.emotions || {}).sort((a,b) => b[1]-a[1]);

  return (
    <div style={{
      background: dark ? "linear-gradient(135deg,#0f0f23,#1a1a3e)" : "#ffffff",
      border:`1px solid ${overall.color}44`, borderRadius:20,
      padding:28, marginTop:24,
      boxShadow:`0 0 40px ${overall.color}22`,
      animation:"fadeIn 0.5s ease",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:24 }}>
        <div style={{
          width:70, height:70, borderRadius:"50%",
          background:`${overall.color}22`, border:`2px solid ${overall.color}`,
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:28,
        }}>
          {overall.icon}
        </div>
        <div>
          <div style={{ fontSize:11, letterSpacing:3, color:"#888", textTransform:"uppercase" }}>Overall Sentiment</div>
          <div style={{ fontSize:30, fontWeight:900, color:overall.color }}>{result.overall}</div>
          <div style={{ fontSize:13, color:"#888" }}>{result.confidence}% confidence</div>
        </div>
        <div style={{ marginLeft:"auto", textAlign:"right" }}>
          <div style={{ fontSize:11, color:"#888", letterSpacing:2, textTransform:"uppercase" }}>Top Emotion</div>
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
            <div style={{ fontSize:11, color:"#888", marginTop:2 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:11, letterSpacing:3, color:"#888", textTransform:"uppercase", marginBottom:14 }}>
          Emotion Breakdown
        </div>
        {sortedEmotions.map(([emotion, score]) => (
          <EmotionBar key={emotion} emotion={emotion} score={score} dark={dark} />
        ))}
      </div>

      {result.text_snippet && (
        <div style={{
          background: dark ? "#ffffff08" : "#f8fafc",
          border:"1px solid #ffffff10", borderRadius:10,
          padding:14, fontSize:13, color:"#888", fontStyle:"italic", lineHeight:1.6,
        }}>
          "{result.text_snippet}"
        </div>
      )}
      {result.transcription && (
        <div style={{ marginTop:12, padding:14, background:"#6366f111", borderRadius:10, border:"1px solid #6366f133" }}>
          <div style={{ fontSize:11, color:"#6366f1", letterSpacing:2, textTransform:"uppercase", marginBottom:6 }}>Transcription</div>
          <div style={{ fontSize:13, color:"#ccc", lineHeight:1.6 }}>{result.transcription}</div>
        </div>
      )}
      {result.page_title && (
        <div style={{ marginTop:12, fontSize:12, color:"#888" }}>
          📄 <span style={{ color:"#8b5cf6" }}>{result.page_title}</span>
        </div>
      )}
      {result.tweets && (
        <div style={{ marginTop:16 }}>
          <div style={{ fontSize:11, color:"#888", letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>
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