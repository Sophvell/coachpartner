import { useState, useEffect, useRef } from "react";

// ─── ICF DATA ────────────────────────────────────────────────────────────────

const GRILLE_ICF = {
  competences: [
    { id: 1, titre: "Fait preuve d'éthique dans sa pratique", sousCriteres: [] },
    { id: 2, titre: "Incarne un état d'esprit Coaching", sousCriteres: [] },
    {
      id: 3,
      titre: "Définit et maintient les contrats",
      sousCriteres: [
        "Explore l'objectif de séance",
        "Explore l'indicateur de séance",
        "Explore l'importance pour le client",
        "Poursuit la séance selon l'agenda défini avec le client",
      ],
    },
    {
      id: 4,
      titre: "Développe un espace de confiance et de sécurité",
      sousCriteres: [
        "Invite le client à réagir à ses interventions",
        "Montre respect, soutien et empathie",
      ],
    },
    {
      id: 5,
      titre: "Reste en présence",
      sousCriteres: ["Fait preuve de curiosité", "Laisse place aux silences"],
    },
    {
      id: 6,
      titre: "Écoute activement",
      sousCriteres: [
        "Pose des questions personnalisées",
        "Explore les mots du client",
        "Explore non-verbal et/ou émotions",
        "Reformule ou résume",
        "Laisse le client s'exprimer sans interrompre (sauf nécessité)",
      ],
    },
    {
      id: 7,
      titre: "Suscite des prises de conscience",
      sousCriteres: [
        "Questionne pour ouvrir de nouvelles perspectives sur la situation et/ou le client",
        "Partage des observations, intuitions, hypothèses, etc. sans vouloir avoir raison",
        "Questions ouvertes, une seule à la fois",
        "Langage concis et clair",
      ],
    },
    {
      id: 8,
      titre: "Facilite la croissance du client",
      sousCriteres: [
        "Invite le client à nommer ses progrès vers son objectif",
        "Est en partenariat avec le client pour concevoir pensée(s), réflexion(s), ou action(s) post séance",
      ],
    },
  ],
};

const NIVEAU_CONFIG = {
  "Maîtrisé":    { color: "#3ECFB2", bg: "rgba(62,207,178,0.12)",  border: "rgba(62,207,178,0.25)",  dot: "#3ECFB2", score: 1.0 },
  "En cours":    { color: "#E8A85C", bg: "rgba(232,168,92,0.12)",  border: "rgba(232,168,92,0.25)",  dot: "#E8A85C", score: 0.6 },
  "Non Acquis":  { color: "#E87A6C", bg: "rgba(232,122,108,0.12)", border: "rgba(232,122,108,0.25)", dot: "#E87A6C", score: 0.2 },
  "Pas observé": { color: "#6B7585", bg: "rgba(107,117,133,0.15)", border: "rgba(107,117,133,0.2)",  dot: "#6B7585", score: 0   },
};

const MAX_AUDIO_DURATION_MINUTES = 120;
const MAX_FILE_SIZE_MB = 30;

// ─── RADAR CHART ─────────────────────────────────────────────────────────────

function RadarChart({ competences }) {
  const size = 320;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 110;
  const n = competences.length;

  const getPoint = (i, r) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  const rings = [0.25, 0.5, 0.75, 1];
  const ringPoints = rings.map((f) =>
    competences.map((_, i) => {
      const p = getPoint(i, maxR * f);
      return `${p.x},${p.y}`;
    }).join(" ")
  );

  const dataPoints = competences.map((c, i) => {
    const cfg = NIVEAU_CONFIG[c.niveau] || NIVEAU_CONFIG["Pas observé"];
    const r = maxR * cfg.score;
    const p = getPoint(i, r);
    return { x: p.x, y: p.y, color: cfg.color, niveau: c.niveau };
  });

  const dataPath = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  const labelRadius = maxR + 28;
  const labels = competences.map((c, i) => {
    const p = getPoint(i, labelRadius);
    const shortTitles = [
      "Éthique", "Esprit coaching", "Contrats", "Confiance",
      "Présence", "Écoute", "Prises de\nconscience", "Croissance\nclient",
    ];
    return { x: p.x, y: p.y, label: shortTitles[i] || c.titre.slice(0, 12) };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3ECFB2" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#E8A85C" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="radarStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3ECFB2" />
          <stop offset="100%" stopColor="#E8A85C" />
        </linearGradient>
      </defs>

      {/* Rings */}
      {ringPoints.map((pts, ri) => (
        <polygon key={ri} points={pts} fill="none"
          stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      ))}

      {/* Axes */}
      {competences.map((_, i) => {
        const p = getPoint(i, maxR);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y}
          stroke="rgba(255,255,255,0.07)" strokeWidth="1" />;
      })}

      {/* Data fill */}
      <polygon points={dataPath} fill="url(#radarFill)" />

      {/* Data stroke */}
      <polygon points={dataPath} fill="none"
        stroke="url(#radarStroke)" strokeWidth="1.5" strokeLinejoin="round" />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4"
          fill={p.color} opacity="0.9" />
      ))}

      {/* Labels */}
      {labels.map((l, i) => {
        const lines = l.label.split("\n");
        const anchor = l.x < cx - 5 ? "end" : l.x > cx + 5 ? "start" : "middle";
        return (
          <text key={i} x={l.x} y={l.y - (lines.length - 1) * 6}
            textAnchor={anchor} fill="rgba(168,176,192,0.85)"
            fontSize="10" fontFamily="'Figtree', sans-serif" fontWeight="400">
            {lines.map((line, li) => (
              <tspan key={li} x={l.x} dy={li === 0 ? 0 : 13}>{line}</tspan>
            ))}
          </text>
        );
      })}
    </svg>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function CoachPartner() {
  const [mode, setMode] = useState("choice");
  const [phase, setPhase] = useState("input");
  const [transcription, setTranscription] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [analyse, setAnalyse] = useState(null);
  const [progress, setProgress] = useState({ message: "", percent: 0 });
  const [error, setError] = useState(null);
  const [analysesUsed, setAnalysesUsed] = useState(0);
  const [showPaywall, setShowPaywall] = useState(true);
  const [unlockCode, setUnlockCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [showRadar, setShowRadar] = useState(false);
  const [expandedComp, setExpandedComp] = useState(null);
  const fileInputRef = useRef(null);

  const VALID_CODES = ["COACH2026", "BETA50", "PARTNER"];

  useEffect(() => {
    const saved = localStorage.getItem("coachpartner_analyses_count");
    if (saved) setAnalysesUsed(parseInt(saved, 10));
  }, []);

  const getAudioDuration = (file) =>
    new Promise((resolve, reject) => {
      const audio = document.createElement("audio");
      audio.preload = "metadata";
      audio.onloadedmetadata = () => {
        window.URL.revokeObjectURL(audio.src);
        resolve(audio.duration / 60);
      };
      audio.onerror = () => reject(new Error("Impossible de lire le fichier audio"));
      audio.src = URL.createObjectURL(file);
    });

  const validateAudioFile = async (file) => {
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_FILE_SIZE_MB)
      return `Fichier trop volumineux (${fileSizeMB.toFixed(1)}MB). Maximum : ${MAX_FILE_SIZE_MB}MB.`;
    const allowedFormats = ["audio/mp3", "audio/mpeg", "audio/m4a", "audio/x-m4a", "audio/wav", "audio/ogg"];
    const ext = file.name.split(".").pop().toLowerCase();
    if (!allowedFormats.includes(file.type) && !["mp3","m4a","wav","ogg"].includes(ext))
      return "Format non supporté. Formats acceptés : MP3, M4A, WAV, OGG";
    try {
      const dur = await getAudioDuration(file);
      if (dur > MAX_AUDIO_DURATION_MINUTES)
        return `Audio trop long (${Math.round(dur)} min). Maximum : ${MAX_AUDIO_DURATION_MINUTES} minutes.`;
    } catch {}
    return null;
  };

  const callBackendAPI = async (endpoint, body) => {
    const res = await fetch(`/api/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Erreur serveur");
    }
    return res.json();
  };

const handleFileInputClick = (e) => {
  if (analysesUsed >= 1) {
    e.preventDefault(); // Empêche l'ouverture du sélecteur
    setShowPaywall(true);
  }
};  

const handleAudioUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  // Vérifier limite AVANT tout traitement
  if (analysesUsed >= 1) {
    setShowPaywall(true);
    e.target.value = ""; // Reset input
    return;
  }
  
  setError(null);
  const validationError = await validateAudioFile(file);
  if (validationError) { 
    setError(validationError); 
    e.target.value = ""; 
    return; 
  }
  
  setAudioFile(file);
  setPhase("transcribing");
  setProgress({ message: "Transcription audio en cours…", percent: 30 });
  
  try {
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Audio = reader.result.split(",")[1];
      const transcriptResult = await callBackendAPI("transcribe", { audioData: base64Audio, fileName: file.name });
      setTranscription(transcriptResult.text);
      setProgress({ message: "Transcription terminée", percent: 50 });
      await analyzeTranscription(transcriptResult.text);
    };
    reader.onerror = () => { throw new Error("Erreur lecture du fichier"); };
    reader.readAsDataURL(file);
  } catch (err) {
    setError(err.message || "Erreur lors de la transcription");
    setPhase("input");
    setProgress({ message: "", percent: 0 });
  }
};

const analyzeTranscription = async (text = transcription) => {
  if (!text.trim()) { setError("Transcription vide"); return; }
  
  // Vérifier limite
  if (analysesUsed >= 1) {
    setShowPaywall(true);
    return;
  }
  
  setPhase("analyzing");
  setError(null);
  setProgress({ message: "Analyse ICF en cours…", percent: 70 });
  
  try {
    const systemPrompt = `Tu es un mentor ICF certifié MCC, spécialisé dans l'évaluation de séances de coaching selon le référentiel ICF (8 compétences clés).
Ton rôle : Analyser objectivement une transcription de séance de coaching.
Principes d'évaluation :
- Base ton analyse UNIQUEMENT sur des éléments observables dans la transcription
- Cite des extraits concrets pour chaque observation
- Sois bienveillant mais rigoureux (mentorat, pas jugement)
- Si une compétence n'est pas observable, indique "Pas observé"
- Pour chaque compétence, évalue : Non Acquis | En cours | Maîtrisé | Pas observé
- Privilégie les feedforward actionnables
Référentiel ICF (8 compétences clés) :
${JSON.stringify(GRILLE_ICF, null, 2)}`;

    const userPrompt = `Analyse cette transcription de séance de coaching selon le référentiel ICF.
TRANSCRIPTION :
${text}
CONSIGNES :
1. Évalue chaque compétence avec son niveau (Non Acquis/En cours/Maîtrisé/Pas observé)
2. Pour chaque compétence, fournis observations concrètes + feedforward actionnable
3. Liste 3-5 points forts globaux
4. Liste 3-5 axes de développement prioritaires
5. Rédige une synthèse narrative (100-150 mots)
RETOURNE UN JSON STRICTEMENT DANS CE FORMAT (sans backticks markdown) :
{
  "competences": [
    {
      "id": 1,
      "titre": "Fait preuve d'éthique dans sa pratique",
      "niveau": "Maîtrisé",
      "observations": "Observations basées sur la transcription avec citations entre guillemets",
      "feedforward": "Suggestion concrète et actionnable",
      "sousCriteres": []
    }
  ],
  "pointsForts": ["Point fort 1 avec exemple", "Point fort 2…"],
  "pointsADevelopper": ["Axe 1 avec suggestion", "Axe 2…"],
  "synthese": "Vue d'ensemble narrative en 100-150 mots",
  "duree_approximative": "durée estimée de la séance",
  "structure_globale": "Commentaire sur ouverture/corps/clôture de séance"
}`;

    const analysisResult = await callBackendAPI("analyze", { systemPrompt, userPrompt });
    setAnalyse(analysisResult);
    setPhase("result");
    setProgress({ message: "Analyse terminée", percent: 100 });
    const newCount = analysesUsed + 1;
    setAnalysesUsed(newCount);
    localStorage.setItem("coachpartner_analyses_count", newCount.toString());
  } catch (err) {
    setError(err.message || "Erreur lors de l'analyse");
    setPhase("input");
    setProgress({ message: "", percent: 0 });
  }
};

  const resetAll = () => {
    setMode("choice"); setPhase("input"); setTranscription(""); setAudioFile(null);
    setAnalyse(null); setError(null); setProgress({ message: "", percent: 0 });
    setShowPaywall(false); setUnlockCode(""); setCodeError("");
    setShowRadar(false); setExpandedComp(null);
  };

  const handleUnlockCode = () => {
    const code = unlockCode.trim().toUpperCase();
    if (VALID_CODES.includes(code)) {
      localStorage.setItem("coachpartner_analyses_count", "0");
      setAnalysesUsed(0); setShowPaywall(false); setUnlockCode(""); setCodeError("");
      alert("Accès débloqué ! Vous pouvez faire une nouvelle analyse.");
    } else {
      setCodeError("Code invalide. Vérifiez votre email ou contactez-nous.");
    }
  };

  // ── STYLES ──────────────────────────────────────────────────────────────────

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,200;0,300;0,400;0,600;1,200;1,300;1,400;1,600&family=Figtree:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --night:   #141820;
      --deep:    #1C2230;
      --surface: #232C3D;
      --surface2:#2B3549;
      --border:  rgba(255,255,255,0.07);
      --border-w:rgba(255,255,255,0.12);
      --teal:    #3ECFB2;
      --teal-dk: #2DB89C;
      --teal-pl: rgba(62,207,178,0.10);
      --teal-bd: rgba(62,207,178,0.22);
      --amber:   #E8A85C;
      --amber-pl:rgba(232,168,92,0.10);
      --amber-bd:rgba(232,168,92,0.22);
      --rose:    #E87A6C;
      --rose-pl: rgba(232,122,108,0.10);
      --rose-bd: rgba(232,122,108,0.22);
      --text:    #F0EDE8;
      --text-2:  #A8B0C0;
      --text-3:  #5C6475;
    }

    body {
      background: var(--night);
      font-family: 'Figtree', sans-serif;
      color: var(--text);
      min-height: 100vh;
    }

    /* ── Ambient glow ── */
    .cp-ambient {
      position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
    }
    .cp-orb {
      position: absolute; border-radius: 50%; filter: blur(90px); opacity: 0.12;
      animation: cpDrift 14s ease-in-out infinite alternate;
    }
    .cp-orb-1 { width:600px;height:600px; background:#5BBFAD; top:-250px;left:-180px; }
    .cp-orb-2 { width:500px;height:500px; background:#E8A85C; bottom:-200px;right:-150px; animation-delay:-6s; }
    @keyframes cpDrift {
      from { transform: translate(0,0) scale(1); }
      to   { transform: translate(25px,18px) scale(1.06); }
    }

    .cp-page {
      position: relative; z-index: 1;
      max-width: 1000px; margin: 0 auto;
      padding: 2.5rem 2rem 5rem;
    }

    /* ── Nav ── */
    .cp-nav {
      display: flex; align-items: center; justify-content: space-between;
      padding-bottom: 2rem; margin-bottom: 4rem;
      border-bottom: 1px solid var(--border);
    }

    /* Navigation links */
    .cp-nav-links {
    display: flex;
    gap: 2rem;
    align-items: center;
    }

    .cp-nav-link {
    font-size: 0.875rem;
    color: var(--text-2);
    text-decoration: none;
    font-weight: 400;
    transition: color 0.2s;
    white-space: nowrap;
    }

    .cp-nav-link:hover {
    color: var(--teal);
    }

    /* Responsive - Cache menu sur mobile */
    @media (max-width: 900px) {
      .cp-nav-links {
        display: none;
      }
    }
    
    .cp-logo {
      font-family: 'Fraunces', serif; font-style: italic;
      font-size: 1.5rem; font-weight: 300; color: var(--text);
      letter-spacing: -0.01em;
    }
    .cp-logo strong {
      font-style: normal; font-weight: 600; color: var(--teal);
    }
    .cp-nav-badge {
      border: 1px solid var(--teal-bd); background: var(--teal-pl);
      padding: 0.35rem 0.875rem; border-radius: 999px;
      font-size: 0.7rem; color: var(--teal); font-weight: 500;
      letter-spacing: 0.06em;
    }
    .cp-nav-badge.used {
      border-color: var(--border); background: rgba(255,255,255,0.04);
      color: var(--text-3);
    }

    /* ── Section head ── */
    .cp-section-head {
      display: flex; align-items: baseline; gap: 1rem; margin-bottom: 1.5rem;
    }
    .cp-section-title {
      font-family: 'Fraunces', serif; font-style: italic;
      font-size: 1.4rem; font-weight: 300; color: var(--text);
      white-space: nowrap;
    }
    .cp-section-line {
      flex: 1; height: 1px; background: var(--border);
    }

    /* ── Hero ── */
    .cp-hero { padding: 0 0 4.5rem; }
    .cp-hero-tag {
      display: inline-flex; align-items: center; gap: 0.5rem;
      background: var(--teal-pl); border: 1px solid var(--teal-bd);
      padding: 0.4rem 1rem; border-radius: 999px;
      font-size: 0.7rem; color: var(--teal); font-weight: 500;
      letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 1.75rem;
    }
    .cp-tag-dot {
      width: 6px; height: 6px; border-radius: 50%; background: var(--teal);
      animation: cpPulse 2.5s ease-in-out infinite;
    }
    @keyframes cpPulse {
      0%,100% { opacity:1; transform:scale(1); }
      50%      { opacity:0.4; transform:scale(0.7); }
    }
    .cp-hero-title {
      font-family: 'Fraunces', serif; font-style: italic;
      font-size: clamp(2.8rem, 5vw, 4rem); font-weight: 200;
      line-height: 1.08; color: var(--text); letter-spacing: -0.02em;
      margin-bottom: 0.25rem;
    }
    .cp-hero-title-2 {
      font-family: 'Fraunces', serif; font-style: normal;
      font-size: clamp(2.8rem, 5vw, 4rem); font-weight: 200;
      line-height: 1.08; color: var(--text-2); letter-spacing: -0.02em;
      margin-bottom: 2rem;
    }
    .cp-hero-title em { color: var(--teal); font-style: italic; }
    .cp-hero-sub {
      font-size: 0.95rem; color: var(--text-2); font-weight: 300;
      line-height: 1.85; max-width: 480px; margin-bottom: 2.5rem;
    }

    /* ── Buttons ── */
    .cp-btn {
      display: inline-flex; align-items: center; gap: 0.5rem;
      border: none; border-radius: 10px;
      padding: 0.8rem 1.75rem;
      font-family: 'Figtree', sans-serif; font-size: 0.875rem; font-weight: 500;
      cursor: pointer; transition: all 0.25s; letter-spacing: 0.01em;
    }
    .cp-btn-primary {
      background: var(--teal); color: var(--night);
    }
    .cp-btn-primary:hover:not(:disabled) {
      background: #4DDFC8; transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(62,207,178,0.25);
    }
    .cp-btn-ghost {
      background: rgba(255,255,255,0.05); color: var(--text-2);
      border: 1px solid var(--border);
    }
    .cp-btn-ghost:hover:not(:disabled) {
      background: rgba(255,255,255,0.09); color: var(--text); border-color: var(--border-w);
    }
    .cp-btn-amber {
      background: var(--amber); color: var(--night);
    }
    .cp-btn-amber:hover:not(:disabled) {
      background: #EFBA73; transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(232,168,92,0.25);
    }
    .cp-btn:disabled { opacity: 0.45; cursor: not-allowed; }

    /* ── Mode cards ── */
    .cp-mode-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;
      margin-bottom: 3rem;
    }
    .cp-mode-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 18px; padding: 2.5rem 2rem;
      cursor: pointer; transition: all 0.3s; position: relative; overflow: hidden;
    }
    .cp-mode-card::after {
      content: ''; position: absolute; inset: 0; border-radius: 18px;
      opacity: 0; transition: opacity 0.3s; pointer-events: none;
    }
    .cp-mode-card.teal::after {
      background: radial-gradient(circle at 85% 15%, rgba(62,207,178,0.08), transparent 65%);
    }
    .cp-mode-card.amber::after {
      background: radial-gradient(circle at 85% 15%, rgba(232,168,92,0.08), transparent 65%);
    }
    .cp-mode-card:hover { border-color: var(--border-w); transform: translateY(-4px); box-shadow: 0 16px 48px rgba(0,0,0,0.3); }
    .cp-mode-card:hover::after { opacity: 1; }

    .cp-card-icon {
      width: 48px; height: 48px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 1.5rem; position: relative; z-index: 1;
    }
    .cp-card-icon.teal { background: var(--teal-pl); }
    .cp-card-icon.amber { background: var(--amber-pl); }

    .cp-card-title {
      font-family: 'Fraunces', serif; font-weight: 400;
      font-size: 1.2rem; color: var(--text); margin-bottom: 0.6rem;
      position: relative; z-index: 1;
    }
    .cp-card-desc {
      font-size: 0.83rem; color: var(--text-2); font-weight: 300;
      line-height: 1.7; margin-bottom: 1.75rem; position: relative; z-index: 1;
    }
    .cp-card-link {
      font-size: 0.8rem; font-weight: 500; position: relative; z-index: 1;
      display: inline-flex; align-items: center; gap: 0.4rem; transition: gap 0.2s;
    }
    .cp-card-link.teal { color: var(--teal); }
    .cp-card-link.amber { color: var(--amber); }
    .cp-mode-card:hover .cp-card-link { gap: 0.7rem; }

    /* ── Form card ── */
    .cp-form-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 20px; padding: 2.75rem; margin-bottom: 1.5rem;
    }
    .cp-form-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 2rem;
    }
    .cp-form-title {
      font-family: 'Fraunces', serif; font-style: italic;
      font-size: 1.5rem; font-weight: 300; color: var(--text);
    }
    .cp-label {
      display: block; font-size: 0.8rem; font-weight: 500;
      color: var(--text-2); letter-spacing: 0.04em; margin-bottom: 0.6rem;
    }
    .cp-textarea {
      width: 100%; min-height: 380px;
      background: rgba(15,20,30,0.5); border: 1.5px solid var(--border);
      border-radius: 12px; padding: 1.25rem;
      color: var(--text); font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 0.85rem; line-height: 1.7; resize: vertical;
      transition: border-color 0.2s;
    }
    .cp-textarea:focus { outline: none; border-color: var(--teal-bd); box-shadow: 0 0 0 3px var(--teal-pl); }
    .cp-textarea::placeholder { color: var(--text-3); }

    /* Audio drop zone */
    .cp-drop-zone {
      border: 2px dashed var(--border); border-radius: 16px;
      padding: 3.5rem 2rem; text-align: center;
      cursor: pointer; transition: all 0.25s;
      background: rgba(15,20,30,0.3);
    }
    .cp-drop-zone:hover, .cp-drop-zone.active {
      border-color: var(--amber-bd); background: var(--amber-pl);
    }
    .cp-drop-zone input[type=file] { display: none; }
    .cp-drop-icon {
      width: 52px; height: 52px; border-radius: 14px;
      background: var(--amber-pl); border: 1px solid var(--amber-bd);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 1.25rem;
    }
    .cp-drop-title {
      font-family: 'Fraunces', serif; font-style: italic;
      font-size: 1.1rem; font-weight: 300; color: var(--text);
      margin-bottom: 0.5rem;
    }
    .cp-drop-desc { font-size: 0.8rem; color: var(--text-3); font-weight: 300; }
    .cp-file-ready {
      display: flex; align-items: center; gap: 1rem;
      background: var(--amber-pl); border: 1px solid var(--amber-bd);
      border-radius: 12px; padding: 1rem 1.5rem; margin-top: 1.25rem;
    }
    .cp-file-name { font-size: 0.875rem; color: var(--amber); font-weight: 500; }
    .cp-file-size { font-size: 0.75rem; color: var(--text-3); margin-top: 2px; }

    /* ── Error ── */
    .cp-error {
      margin-top: 1.25rem; padding: 1.1rem 1.25rem;
      background: var(--rose-pl); border: 1px solid var(--rose-bd);
      border-radius: 12px; color: #F0A09A;
      font-size: 0.875rem; line-height: 1.6; white-space: pre-line;
    }

    /* ── Processing ── */
    .cp-processing {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 20px; padding: 5rem 2rem;
      text-align: center;
    }
    .cp-spinner {
      width: 56px; height: 56px;
      border: 3px solid var(--teal-pl); border-top-color: var(--teal);
      border-radius: 50%; margin: 0 auto 2rem;
      animation: cpSpin 0.9s linear infinite;
    }
    @keyframes cpSpin { to { transform: rotate(360deg); } }
    .cp-processing-title {
      font-family: 'Fraunces', serif; font-style: italic;
      font-size: 1.5rem; font-weight: 300; color: var(--text);
      margin-bottom: 0.75rem;
    }
    .cp-processing-sub { font-size: 0.85rem; color: var(--text-3); font-weight: 300; }
    .cp-progress-bar {
      max-width: 360px; margin: 2rem auto;
      height: 4px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden;
    }
    .cp-progress-fill {
      height: 100%; border-radius: 2px;
      background: linear-gradient(90deg, var(--teal), var(--amber));
      transition: width 0.6s ease;
    }

    /* ── Results ── */
    .cp-results-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 2.5rem; flex-wrap: wrap; gap: 1rem;
    }
    .cp-results-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }

    /* Synthese card */
    .cp-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 20px; padding: 2.5rem; margin-bottom: 1.5rem;
    }
    .cp-synthese-text {
      font-family: 'Fraunces', serif; font-style: italic; font-weight: 200;
      font-size: 1.05rem; color: var(--text-2); line-height: 1.95;
      max-width: 700px;
    }
    .cp-meta-row {
      display: flex; gap: 3rem; margin-top: 2rem; padding-top: 1.5rem;
      border-top: 1px solid var(--border); flex-wrap: wrap; gap: 2rem;
    }
    .cp-meta-label {
      font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.15em;
      color: var(--text-3); font-weight: 500; margin-bottom: 0.4rem;
    }
    .cp-meta-value { font-size: 0.9rem; color: var(--text-2); font-weight: 400; }

    /* Radar toggle */
    .cp-radar-toggle {
      display: flex; align-items: center; justify-content: space-between;
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 16px; padding: 1.25rem 1.75rem;
      cursor: pointer; transition: all 0.2s; margin-bottom: 1.5rem;
    }
    .cp-radar-toggle:hover { border-color: var(--border-w); background: var(--surface2); }
    .cp-radar-label {
      font-family: 'Fraunces', serif; font-style: italic;
      font-size: 1rem; font-weight: 300; color: var(--text-2);
    }
    .cp-radar-chevron {
      color: var(--text-3); transition: transform 0.3s; font-size: 1.1rem;
    }
    .cp-radar-chevron.open { transform: rotate(180deg); }

    .cp-radar-panel {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 20px; padding: 2.5rem;
      display: flex; justify-content: center;
      margin-bottom: 1.5rem;
    }

    /* Points forts / axes */
    .cp-dual-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.5rem;
    }
    .cp-list-item {
      display: flex; align-items: flex-start; gap: 0.875rem;
      padding: 1rem 1.25rem; border-radius: 12px; margin-bottom: 0.75rem;
      font-size: 0.875rem; line-height: 1.65; font-weight: 300; color: var(--text-2);
    }
    .cp-list-item:last-child { margin-bottom: 0; }
    .cp-list-item.green { background: var(--teal-pl); border: 1px solid var(--teal-bd); }
    .cp-list-item.amber { background: var(--amber-pl); border: 1px solid var(--amber-bd); }
    .cp-list-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; margin-top: 6px; }
    .cp-list-dot.green { background: var(--teal); }
    .cp-list-dot.amber { background: var(--amber); }

    /* Competences */
    .cp-comp-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 16px; overflow: hidden; margin-bottom: 0.75rem;
      transition: border-color 0.2s;
    }
    .cp-comp-card:hover { border-color: var(--border-w); }
    .cp-comp-header {
      display: flex; align-items: center; gap: 1.25rem;
      padding: 1.25rem 1.5rem; cursor: pointer;
    }
    .cp-comp-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .cp-comp-num {
      font-family: 'Fraunces', serif; font-size: 1.1rem; font-weight: 300;
      color: var(--text-3); min-width: 28px;
    }
    .cp-comp-name {
      flex: 1; font-size: 0.9rem; color: var(--text); font-weight: 400;
      letter-spacing: 0.01em;
    }
    .cp-comp-badge {
      font-size: 0.68rem; font-weight: 600; padding: 0.28rem 0.75rem;
      border-radius: 999px; letter-spacing: 0.05em; white-space: nowrap;
    }
    .cp-comp-chevron {
      color: var(--text-3); font-size: 0.8rem; transition: transform 0.3s; margin-left: 0.5rem;
    }
    .cp-comp-chevron.open { transform: rotate(180deg); }

    .cp-comp-body {
      padding: 0 1.5rem 1.5rem 4rem; border-top: 1px solid var(--border);
      padding-top: 1.25rem;
    }
    .cp-comp-section-label {
      font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.15em;
      color: var(--text-3); font-weight: 500; margin-bottom: 0.5rem;
    }
    .cp-comp-obs {
      font-size: 0.875rem; color: var(--text-2); font-weight: 300;
      line-height: 1.75; margin-bottom: 1.25rem;
    }
    .cp-comp-ff {
      display: flex; gap: 0.75rem; align-items: flex-start;
      background: var(--amber-pl); border: 1px solid var(--amber-bd);
      border-radius: 10px; padding: 1rem 1.1rem;
    }
    .cp-comp-ff-text {
      font-size: 0.85rem; color: var(--amber); font-weight: 400; line-height: 1.6;
    }

    /* Paywall modal */
    .cp-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.75);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000; padding: 2rem; backdrop-filter: blur(6px);
    }
    .cp-modal {
      background: var(--deep); border: 1px solid var(--border-w);
      border-radius: 24px; padding: 3rem; max-width: 520px; width: 100%;
      position: relative;
    }
    .cp-modal-title {
      font-family: 'Fraunces', serif; font-style: italic;
      font-size: 1.75rem; font-weight: 300; color: var(--text);
      margin-bottom: 0.75rem;
    }
    .cp-modal-sub {
      font-size: 0.9rem; color: var(--text-2); font-weight: 300;
      line-height: 1.7; margin-bottom: 2rem;
    }
    .cp-price-box {
      background: var(--teal-pl); border: 1px solid var(--teal-bd);
      border-radius: 14px; padding: 1.5rem; text-align: center; margin-bottom: 2rem;
    }
    .cp-price { font-family: 'Fraunces', serif; font-size: 3rem; font-weight: 400; color: var(--teal); }
    .cp-price-label { font-size: 0.8rem; color: var(--text-3); margin-top: 0.25rem; }

    .cp-divider {
      display: flex; align-items: center; gap: 1rem;
      margin: 1.5rem 0; color: var(--text-3); font-size: 0.8rem;
    }
    .cp-divider::before, .cp-divider::after {
      content: ''; flex: 1; height: 1px; background: var(--border);
    }

    .cp-input {
      width: 100%; background: rgba(15,20,30,0.5);
      border: 1.5px solid var(--border); border-radius: 10px;
      padding: 0.875rem 1rem; color: var(--text);
      font-family: 'Figtree', sans-serif; font-size: 0.9rem;
      transition: border-color 0.2s;
    }
    .cp-input:focus { outline: none; border-color: var(--teal-bd); box-shadow: 0 0 0 3px var(--teal-pl); }
    .cp-input::placeholder { color: var(--text-3); }
    .cp-code-row { display: flex; gap: 0.75rem; margin-bottom: 0.75rem; }
    .cp-code-error {
      background: var(--rose-pl); border: 1px solid var(--rose-bd);
      border-radius: 8px; padding: 0.75rem 1rem;
      font-size: 0.82rem; color: #F0A09A; margin-bottom: 1.25rem;
    }
    .cp-contact {
      font-size: 0.82rem; color: var(--text-3); text-align: center; margin-bottom: 1.5rem;
    }
    .cp-contact a { color: var(--teal); text-decoration: none; }
    .cp-contact a:hover { text-decoration: underline; }

    /* ── Footer ── */
    .cp-footer {
      margin-top: 4rem; padding-top: 2rem;
      border-top: 1px solid var(--border); text-align: center;
    }
    .cp-footer p { font-size: 0.75rem; color: var(--text-3); font-weight: 300; line-height: 2; }
    .cp-footer em { color: var(--text-2); font-style: normal; }

    /* ── Animations ── */
    @keyframes cpFadeUp {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .cp-anim { animation: cpFadeUp 0.5s ease both; }
    .cp-anim-1 { animation-delay: 0.05s; }
    .cp-anim-2 { animation-delay: 0.15s; }
    .cp-anim-3 { animation-delay: 0.25s; }
    .cp-anim-4 { animation-delay: 0.35s; }

    @media (max-width: 640px) {
      .cp-mode-grid { grid-template-columns: 1fr; }
      .cp-dual-grid { grid-template-columns: 1fr; }
      .cp-hero-title, .cp-hero-title-2 { font-size: 2.4rem; }
      .cp-comp-body { padding-left: 1.5rem; }
    }
    @media print { .no-print { display: none !important; } }
  `;

  // ── RENDER ──────────────────────────────────────────────────────────────────

  const getNiveauCfg = (niveau) => NIVEAU_CONFIG[niveau] || NIVEAU_CONFIG["Pas observé"];

  return (
    <div>
      <style>{css}</style>

      {/* Ambient background */}
      <div className="cp-ambient">
        <div className="cp-orb cp-orb-1" />
        <div className="cp-orb cp-orb-2" />
      </div>

      <div className="cp-page">

        {/* ── NAV ── */}
        <nav className="cp-nav cp-anim cp-anim-1">
          <div className="cp-logo">
            Coach<strong>Partner</strong>
          </div>
  
        {/* Menu navigation */}
        <div className="cp-nav-links">
          <a href="/" className="cp-nav-link">Accueil</a>
          <a href="/framework-icf.html" className="cp-nav-link">Référentiel ICF</a>
          <a href="/prix.html" className="cp-nav-link">Prix</a>
          <a href="/contact.html" className="cp-nav-link">Contact</a>
        </div>
  
        <span className={`cp-nav-badge ${analysesUsed >= 1 ? "used" : ""}`}>
          {analysesUsed === 0 ? "1 analyse gratuite" : "Analyse utilisée"}
        </span>
        </nav>

        {/* ── PAYWALL MODAL ── */}
        {showPaywall && (
          <div className="cp-overlay" onClick={() => setShowPaywall(false)}>
            <div className="cp-modal" onClick={(e) => e.stopPropagation()}>
              <h2 className="cp-modal-title">Continuez à progresser</h2>
              <p className="cp-modal-sub">
                Votre analyse gratuite a été utilisée. Pour continuer à améliorer votre pratique ICF, débloquez une nouvelle analyse.
              </p>

              <div className="cp-price-box">
                <div className="cp-price">5€</div>
                <div className="cp-price-label">par analyse · accès immédiat</div>
              </div>

              <button
                className="cp-btn cp-btn-primary"
                style={{ width: "100%", justifyContent: "center", marginBottom: "0.5rem" }}
                onClick={() => window.open("https://buy.stripe.com/cNi28qalV8VW6aL1xsaAw00", "_blank")}
              >
                Payer 5€ et continuer
              </button>

              <div className="cp-divider">ou</div>

              <label className="cp-label">Vous avez déjà payé ? Entrez votre code</label>
              <div className="cp-code-row">
                <input
                  className="cp-input"
                  type="text"
                  value={unlockCode}
                  onChange={(e) => { setUnlockCode(e.target.value.toUpperCase()); setCodeError(""); }}
                  placeholder="Ex : COACH2026"
                  style={{ textTransform: "uppercase", fontFamily: "monospace", fontWeight: 600 }}
                />
                <button className="cp-btn cp-btn-primary" onClick={handleUnlockCode} style={{ whiteSpace: "nowrap" }}>
                  Débloquer
                </button>
              </div>
              {codeError && <div className="cp-code-error">{codeError}</div>}

              <p className="cp-contact">
                Questions ? <a href="mailto:contact@coachpartner.app">contact@coachpartner.app</a>
              </p>

              <button
                className="cp-btn cp-btn-ghost"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={() => setShowPaywall(false)}
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════
            PHASE : CHOICE
        ═══════════════════════════════════════════ */}
        {mode === "choice" && phase === "input" && (
          <div>
            {/* Hero */}
            <div className="cp-hero">
              <div className="cp-hero-tag cp-anim cp-anim-1">
                <span className="cp-tag-dot" />
                Évaluation ICF · IA
              </div>
              <h1 className="cp-hero-title cp-anim cp-anim-2">Analysez vos séances</h1>
              <h1 className="cp-hero-title-2 cp-anim cp-anim-2">avec <em>clarté</em>.</h1>
              <p className="cp-hero-sub cp-anim cp-anim-3">
                Un miroir fidèle de vos 8 compétences ICF. Feedback bienveillant, feedforward actionnable — en 2 minutes.
              </p>
            </div>

            {/* Mode cards */}
            <div className="cp-section-head cp-anim cp-anim-3">
              <span className="cp-section-title">Comment souhaitez-vous démarrer ?</span>
              <div className="cp-section-line" />
            </div>

            <div className="cp-mode-grid cp-anim cp-anim-4">
              <div className="cp-mode-card teal" onClick={() => setMode("manual")}>
                <div className="cp-card-icon teal">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3ECFB2" strokeWidth="1.8">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </div>
                <h2 className="cp-card-title">Coller une transcription</h2>
                <p className="cp-card-desc">
                  Vous avez déjà la retranscription de votre séance ? Collez-la pour une analyse instantanée des 8 compétences.
                </p>
                <span className="cp-card-link teal">Commencer →</span>
              </div>

              <div className="cp-mode-card amber" onClick={() => setMode("audio")}>
                <div className="cp-card-icon amber">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E8A85C" strokeWidth="1.8">
                    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
                    <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/>
                  </svg>
                </div>
                <h2 className="cp-card-title">Déposer un fichier audio</h2>
                <p className="cp-card-desc">
                  Transcription et analyse automatiques de votre enregistrement. MP3, M4A, WAV — jusqu'à 60 minutes.
                </p>
                <span className="cp-card-link amber">Déposer un fichier →</span>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════
            PHASE : MANUAL INPUT
        ═══════════════════════════════════════════ */}
        {mode === "manual" && phase === "input" && (
          <div className="cp-anim cp-anim-1">
            <div className="cp-form-card">
              <div className="cp-form-header">
                <h2 className="cp-form-title">Transcription de séance</h2>
                <button className="cp-btn cp-btn-ghost" onClick={() => setMode("choice")}>
                  ← Retour
                </button>
              </div>
              <label className="cp-label">Collez ici la transcription de votre séance</label>
              <textarea
                className="cp-textarea"
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
                placeholder={`Format suggéré :\n\nC : Bonjour ! Quel est votre objectif pour cette séance ?\n\nCl : Je souhaite travailler sur ma confiance au travail.\n\nC : D'accord. Sur une échelle de 1 à 10, où vous situez-vous ?\n\n…`}
              />
              {error && <div className="cp-error">{error}</div>}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button
                className="cp-btn cp-btn-primary"
                onClick={() => {
                if (analysesUsed >= 1) {
                  setShowPaywall(true);
                } else {
                  analyzeTranscription();
                }
              }}
              >
              Analyser cette transcription
            </button>
            </div>
          </div>
        )}
        {/* ═══════════════════════════════════════════
            PHASE : AUDIO INPUT
        ═══════════════════════════════════════════ */}
        {mode === "audio" && phase === "input" && (
          <div className="cp-anim cp-anim-1">
            <div className="cp-form-card">
              <div className="cp-form-header">
                <h2 className="cp-form-title">Upload audio</h2>
                <button className="cp-btn cp-btn-ghost" onClick={() => setMode("choice")}>
                  ← Retour
                </button>
              </div>

              <div
                className={`cp-drop-zone ${audioFile ? "active" : ""}`}
                onClick={() => !analysesUsed && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  style={{ display: "none" }}
                  id="audio-upload"
                />
                <div className="cp-drop-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E8A85C" strokeWidth="1.8">
                    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
                    <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/>
                  </svg>
                </div>
                <div className="cp-drop-title">Déposez votre fichier audio ici</div>
                <div className="cp-drop-desc" style={{ marginTop: "0.4rem" }}>
                  MP3, M4A, WAV, OGG · max {MAX_AUDIO_DURATION_MINUTES} min · max {MAX_FILE_SIZE_MB}MB
                </div>
                {!audioFile && (
                  <button
                    className="cp-btn cp-btn-amber"
                    style={{ marginTop: "1.5rem" }}
                    onClick={(e) => { e.stopPropagation(); 
                    if (analysesUsed >= 1) {
                      setShowPaywall(true);
                    } else {
                      fileInputRef.current?.click();
                    }
                  }} 
        
                  >
                    Parcourir les fichiers
                  </button>
                )}
              </div>

              {audioFile && (
                <div className="cp-file-ready">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8A85C" strokeWidth="2">
                    <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                  </svg>
                  <div>
                    <div className="cp-file-name">{audioFile.name}</div>
                    <div className="cp-file-size">{(audioFile.size / 1024 / 1024).toFixed(1)} MB</div>
                  </div>
                </div>
              )}

              {error && <div className="cp-error">{error}</div>}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════
            PHASE : PROCESSING
        ═══════════════════════════════════════════ */}
        {(phase === "transcribing" || phase === "analyzing") && (
          <div className="cp-processing cp-anim cp-anim-1">
            <div className="cp-spinner" />
            <h2 className="cp-processing-title">{progress.message}</h2>
            <div className="cp-progress-bar">
              <div className="cp-progress-fill" style={{ width: `${progress.percent}%` }} />
            </div>
            <p className="cp-processing-sub">
              {phase === "transcribing" && "Conversion de l'audio en texte…"}
              {phase === "analyzing" && "Évaluation des 8 compétences ICF en cours…"}
            </p>
          </div>
        )}

        {/* ═══════════════════════════════════════════
            PHASE : RESULTS
        ═══════════════════════════════════════════ */}
        {phase === "result" && analyse && (
          <div className="cp-anim cp-anim-1">

            {/* Actions */}
            <div className="cp-results-header no-print">
              <div className="cp-section-head" style={{ margin: 0, flex: 1 }}>
                <span className="cp-section-title">Rapport d'analyse</span>
                <div className="cp-section-line" />
              </div>
              <div className="cp-results-actions" style={{ marginLeft: "1.5rem" }}>
                <button className="cp-btn cp-btn-ghost" onClick={resetAll}>← Nouvelle analyse</button>
                <button className="cp-btn cp-btn-primary" onClick={() => window.print()}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
                    <path d="M6 14h12v8H6z"/>
                  </svg>
                  Imprimer
                </button>
              </div>
            </div>

            {/* Synthèse */}
            <div className="cp-card">
              <div className="cp-section-head" style={{ marginBottom: "1.25rem" }}>
                <span className="cp-section-title">Synthèse globale</span>
                <div className="cp-section-line" />
              </div>
              <p className="cp-synthese-text">"{analyse.synthese}"</p>
              {(analyse.duree_approximative || analyse.structure_globale) && (
                <div className="cp-meta-row">
                  {analyse.duree_approximative && (
                    <div>
                      <div className="cp-meta-label">Durée estimée</div>
                      <div className="cp-meta-value">{analyse.duree_approximative}</div>
                    </div>
                  )}
                  {analyse.structure_globale && (
                    <div style={{ flex: 1 }}>
                      <div className="cp-meta-label">Structure globale</div>
                      <div className="cp-meta-value">{analyse.structure_globale}</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Radar toggle */}
            <div className="no-print">
              <div className="cp-radar-toggle" onClick={() => setShowRadar(!showRadar)}>
                <span className="cp-radar-label">Visualisation radar — profil des 8 compétences</span>
                <span className={`cp-radar-chevron ${showRadar ? "open" : ""}`}>▾</span>
              </div>
              {showRadar && (
                <div className="cp-radar-panel">
                  <RadarChart competences={analyse.competences} />
                </div>
              )}
            </div>

            {/* Points forts + Axes */}
            <div className="cp-dual-grid">
              <div className="cp-card">
                <div className="cp-section-head" style={{ marginBottom: "1.25rem" }}>
                  <span className="cp-section-title">Points forts</span>
                  <div className="cp-section-line" />
                </div>
                {analyse.pointsForts.map((p, i) => (
                  <div key={i} className="cp-list-item green">
                    <div className="cp-list-dot green" />
                    {p}
                  </div>
                ))}
              </div>
              <div className="cp-card">
                <div className="cp-section-head" style={{ marginBottom: "1.25rem" }}>
                  <span className="cp-section-title">Axes de développement</span>
                  <div className="cp-section-line" />
                </div>
                {analyse.pointsADevelopper.map((p, i) => (
                  <div key={i} className="cp-list-item amber">
                    <div className="cp-list-dot amber" />
                    {p}
                  </div>
                ))}
              </div>
            </div>

            {/* Compétences détaillées */}
            <div className="cp-section-head">
              <span className="cp-section-title">8 compétences ICF — évaluation détaillée</span>
              <div className="cp-section-line" />
            </div>

            {analyse.competences.map((comp) => {
              const cfg = getNiveauCfg(comp.niveau);
              const isOpen = expandedComp === comp.id;
              return (
                <div key={comp.id} className="cp-comp-card">
                  <div className="cp-comp-header" onClick={() => setExpandedComp(isOpen ? null : comp.id)}>
                    <div className="cp-comp-dot" style={{ background: cfg.dot }} />
                    <span className="cp-comp-num">{String(comp.id).padStart(2, "0")}</span>
                    <span className="cp-comp-name">{comp.titre}</span>
                    <span
                      className="cp-comp-badge"
                      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                    >
                      {comp.niveau}
                    </span>
                    <span className={`cp-comp-chevron ${isOpen ? "open" : ""}`}>▾</span>
                  </div>

                  {isOpen && (
                    <div className="cp-comp-body">
                      {comp.observations && (
                        <>
                          <div className="cp-comp-section-label">Observations</div>
                          <p className="cp-comp-obs">{comp.observations}</p>
                        </>
                      )}
                      {comp.feedforward && (
                        <>
                          <div className="cp-comp-section-label">Feedforward</div>
                          <div className="cp-comp-ff">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E8A85C" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
                              <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
                            </svg>
                            <span className="cp-comp-ff-text">{comp.feedforward}</span>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Footer */}
            <div className="cp-footer">
              <p>Rapport généré par <em>CoachPartner</em> · Référentiel ICF — 8 compétences clés · Analyse par IA</p>
              <p>Outil d'aide à l'analyse — ne remplace pas l'évaluation d'un mentor certifié ICF</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
