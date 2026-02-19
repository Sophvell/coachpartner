import { useState, useEffect } from "react";

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

const NIVEAUX_COLORS = {
  "Non Acquis": "#dc2626",
  "En cours": "#f59e0b",
  "Maîtrisé": "#16a34a",
  "Pas observé": "#6b7280",
};

const MAX_AUDIO_DURATION_MINUTES = 60;
const MAX_FILE_SIZE_MB = 25;

export default function CoachPartner() {
  const [mode, setMode] = useState("choice"); // choice | manual | audio
  const [phase, setPhase] = useState("input"); // input | transcribing | analyzing | result
  const [transcription, setTranscription] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [analyse, setAnalyse] = useState(null);
  const [progress, setProgress] = useState({ message: "", percent: 0 });
  const [error, setError] = useState(null);
  const [analysesUsed, setAnalysesUsed] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [unlockCode, setUnlockCode] = useState("");
  const [codeError, setCodeError] = useState("");

  // Codes de déblocage valides (vous les générez et les donnez aux clients)
  const VALID_CODES = [
    "COACH2026",
    "BETA50",
    "PARTNER",
    // Ajoutez vos codes ici au fur et à mesure
  ];

  // Charger le compteur depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem("coachpartner_analyses_count");
    if (saved) {
      setAnalysesUsed(parseInt(saved, 10));
    }
  }, []);

  const getAudioDuration = (file) => {
    return new Promise((resolve, reject) => {
      const audio = document.createElement("audio");
      audio.preload = "metadata";
      
      audio.onloadedmetadata = () => {
        window.URL.revokeObjectURL(audio.src);
        const durationMinutes = audio.duration / 60;
        resolve(durationMinutes);
      };
      
      audio.onerror = () => {
        reject(new Error("Impossible de lire le fichier audio"));
      };
      
      audio.src = URL.createObjectURL(file);
    });
  };

  const validateAudioFile = async (file) => {
    // Vérifier taille
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      return `Fichier trop volumineux (${fileSizeMB.toFixed(1)}MB). Maximum accepté : ${MAX_FILE_SIZE_MB}MB.`;
    }

    // Vérifier format
    const allowedFormats = ["audio/mp3", "audio/mpeg", "audio/m4a", "audio/x-m4a", "audio/wav", "audio/ogg"];
    const fileExtension = file.name.split(".").pop().toLowerCase();
    const allowedExtensions = ["mp3", "m4a", "wav", "ogg"];
    
    if (!allowedFormats.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      return `Format non supporté. Formats acceptés : MP3, M4A, WAV, OGG`;
    }

    // Vérifier durée
    try {
      const durationMinutes = await getAudioDuration(file);
      if (durationMinutes > MAX_AUDIO_DURATION_MINUTES) {
        return `Audio trop long (${Math.round(durationMinutes)} minutes). Maximum accepté : ${MAX_AUDIO_DURATION_MINUTES} minutes.\n\n💡 Astuce : Les séances ICF durent généralement 45-60 minutes. Vous pouvez couper votre audio en plusieurs parties ou nous contacter pour les séances plus longues.`;
      }
    } catch (err) {
      console.error("Erreur validation durée:", err);
      // On continue même si on ne peut pas vérifier la durée
    }

    return null; // Validation OK
  };

  const callBackendAPI = async (endpoint, body) => {
    const response = await fetch(`/api/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Erreur serveur");
    }

    return response.json();
  };

  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vérifier limite freemium
    if (analysesUsed >= 1) {
      setShowPaywall(true);
      return;
    }

    setError(null);

    // Validation
    const validationError = await validateAudioFile(file);
    if (validationError) {
      setError(validationError);
      e.target.value = ""; // Reset input
      return;
    }

    setAudioFile(file);
    setPhase("transcribing");
    setProgress({ message: "Transcription audio en cours...", percent: 30 });

    try {
      // Convertir en base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Audio = reader.result.split(",")[1];
        
        // Appel API backend pour transcription
        const transcriptResult = await callBackendAPI("transcribe", {
          audioData: base64Audio,
          fileName: file.name,
        });

        setTranscription(transcriptResult.text);
        setProgress({ message: "Transcription terminée", percent: 50 });

        // Analyse automatique
        await analyzeTranscription(transcriptResult.text);
      };
      reader.onerror = () => {
        throw new Error("Erreur lecture du fichier");
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setError(err.message || "Erreur lors de la transcription");
      setPhase("input");
      setProgress({ message: "", percent: 0 });
    }
  };

  const analyzeTranscription = async (text = transcription) => {
    if (!text.trim()) {
      setError("Transcription vide");
      return;
    }

    // Vérifier limite freemium
    if (analysesUsed >= 1) {
      setShowPaywall(true);
      return;
    }

    setPhase("analyzing");
    setError(null);
    setProgress({ message: "Analyse ICF en cours...", percent: 70 });

    try {
      const systemPrompt = `Tu es un mentor ICF certifié PCC, spécialisé dans l'évaluation de séances de coaching selon le référentiel ICF (8 compétences clés).

Ton rôle : Analyser objectivement une transcription de séance de coaching.

Principes d'évaluation :
- Base ton analyse UNIQUEMENT sur des éléments observables dans la transcription
- Cite des extraits concrets pour chaque observation
- Sois bienveillant mais rigoureux (mentorat, pas jugement)
- Si une compétence n'est pas observable, indique "Pas observé" (ne pas inventer)
- Pour chaque compétence, évalue : Non Acquis | En cours | Maîtrisé | Pas observé
- Privilégie les feedforward actionnables (comment progresser)

Référentiel ICF (8 compétences clés) :
${JSON.stringify(GRILLE_ICF, null, 2)}`;

      const userPrompt = `Analyse cette transcription de séance de coaching selon le référentiel ICF (8 compétences clés).

TRANSCRIPTION :
${text}

CONSIGNES :
1. Évalue chaque compétence avec son niveau (Non Acquis/En cours/Maîtrisé/Pas observé)
2. Pour chaque compétence, fournis :
   - Observations concrètes (avec citations de la transcription)
   - Feedforward actionnable (1-2 suggestions de progression)
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
  "pointsForts": ["Point fort 1 avec exemple", "Point fort 2..."],
  "pointsADevelopper": ["Axe 1 avec suggestion", "Axe 2..."],
  "synthese": "Vue d'ensemble narrative en 100-150 mots",
  "duree_approximative": "durée estimée de la séance",
  "structure_globale": "Commentaire sur ouverture/corps/clôture de séance"
}`;

      // Appel API backend pour analyse
      const analysisResult = await callBackendAPI("analyze", {
        systemPrompt,
        userPrompt,
      });

      setAnalyse(analysisResult);
      setPhase("result");
      setProgress({ message: "Analyse terminée", percent: 100 });

      // Incrémenter compteur
      const newCount = analysesUsed + 1;
      setAnalysesUsed(newCount);
      localStorage.setItem("coachpartner_analyses_count", newCount.toString());
    } catch (err) {
      console.error(err);
      setError(err.message || "Erreur lors de l'analyse");
      setPhase("input");
      setProgress({ message: "", percent: 0 });
    }
  };

  const resetAll = () => {
    setMode("choice");
    setPhase("input");
    setTranscription("");
    setAudioFile(null);
    setAnalyse(null);
    setError(null);
    setProgress({ message: "", percent: 0 });
    setShowPaywall(false);
    setUnlockCode("");
    setCodeError("");
  };

  const handleUnlockCode = () => {
    const code = unlockCode.trim().toUpperCase();
    
    if (VALID_CODES.includes(code)) {
      // Code valide : reset le compteur
      localStorage.setItem("coachpartner_analyses_count", "0");
      setAnalysesUsed(0);
      setShowPaywall(false);
      setUnlockCode("");
      setCodeError("");
      alert("✅ Accès débloqué ! Vous pouvez maintenant faire une nouvelle analyse.");
    } else {
      setCodeError("Code invalide. Vérifiez votre email ou contactez-nous.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1419 100%)",
        fontFamily: "'Inter var', system-ui, sans-serif",
        color: "#f1f5f9",
        padding: "2rem",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        .gradient-text {
          background: linear-gradient(135deg, #60a5fa 0%, #c084fc 50%, #f472b6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .card {
          background: rgba(30, 41, 59, 0.4);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          transition: all 0.3s ease;
        }
        
        .card:hover {
          border-color: rgba(148, 163, 184, 0.2);
          box-shadow: 0 12px 48px rgba(0, 0, 0, 0.5);
        }
        
        .mode-card {
          cursor: pointer;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s ease;
        }
        
        .mode-card:hover {
          transform: translateY(-8px);
          border-color: #60a5fa;
        }
        
        .competence-card {
          background: rgba(51, 65, 85, 0.3);
          border: 1px solid rgba(148, 163, 184, 0.15);
          border-radius: 16px;
          padding: 1.75rem;
          margin-bottom: 1.25rem;
          transition: all 0.3s ease;
        }
        
        .competence-card:hover {
          transform: translateX(4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          border-color: rgba(96, 165, 250, 0.3);
        }
        
        button {
          border: none;
          border-radius: 12px;
          padding: 1rem 2rem;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        
        button:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }
        
        button:active:not(:disabled) {
          transform: translateY(0);
        }
        
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        input, textarea {
          width: 100%;
          background: rgba(15, 23, 42, 0.6);
          border: 2px solid rgba(148, 163, 184, 0.2);
          border-radius: 12px;
          padding: 1rem;
          color: #e2e8f0;
          font-family: inherit;
          font-size: 0.95rem;
          transition: all 0.2s ease;
        }
        
        input:focus, textarea:focus {
          outline: none;
          border-color: #60a5fa;
          box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.1);
        }
        
        .progress-bar {
          height: 8px;
          background: rgba(148, 163, 184, 0.2);
          border-radius: 4px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #60a5fa, #c084fc);
          transition: width 0.5s ease;
        }
        
        @keyframes spin { to { transform: rotate(360deg); } }
        @media print { .no-print { display: none; } }
      `}</style>

      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <header style={{ marginBottom: "3rem", textAlign: "center" }}>
          <h1
            className="gradient-text"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "4rem",
              fontWeight: "900",
              marginBottom: "0.75rem",
              lineHeight: "1",
            }}
          >
            CoachPartner
          </h1>
          <p
            style={{
              fontSize: "1.25rem",
              color: "#94a3b8",
              fontWeight: "300",
              letterSpacing: "0.05em",
            }}
          >
            Analysez vos séances selon le référentiel ICF en 2 minutes
          </p>
          
          {/* Compteur analyses */}
          <div style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#cbd5e1" }}>
            {analysesUsed === 0 && "🎁 1 analyse gratuite disponible"}
            {analysesUsed >= 1 && "✨ Analyse gratuite utilisée"}
          </div>
        </header>

        {/* Paywall Modal */}
        {showPaywall && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "2rem",
            }}
            onClick={() => setShowPaywall(false)}
          >
            <div
              className="card"
              style={{ padding: "3rem", maxWidth: "550px", textAlign: "center" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✨</div>
              <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
                Vous avez aimé CoachPartner ?
              </h2>
              <p style={{ color: "#cbd5e1", marginBottom: "2rem", lineHeight: "1.6" }}>
                Votre analyse gratuite a été utilisée. Continuez à progresser pour seulement 5€ par analyse.
              </p>
              
              <div style={{ background: "rgba(96, 165, 250, 0.1)", padding: "1.5rem", borderRadius: "12px", marginBottom: "2rem" }}>
                <div style={{ fontSize: "3rem", fontWeight: "700", color: "#60a5fa" }}>5€</div>
                <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>par analyse</div>
              </div>

              {/* Bouton Paiement Stripe */}
              <button
                onClick={() => window.open("VOTRE_LIEN_STRIPE_ICI", "_blank")}
                style={{ 
                  background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)", 
                  color: "white", 
                  width: "100%",
                  marginBottom: "1.5rem",
                  fontSize: "1.1rem",
                  padding: "1.25rem",
                }}
              >
                💳 Payer 5€ maintenant
              </button>

              {/* Séparateur */}
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "1rem", 
                margin: "2rem 0",
                color: "#64748b",
                fontSize: "0.9rem"
              }}>
                <div style={{ flex: 1, height: "1px", background: "rgba(148, 163, 184, 0.2)" }}></div>
                <span>OU</span>
                <div style={{ flex: 1, height: "1px", background: "rgba(148, 163, 184, 0.2)" }}></div>
              </div>

              {/* Code de déblocage */}
              <div style={{ textAlign: "left", marginBottom: "2rem" }}>
                <label style={{ display: "block", marginBottom: "0.75rem", fontWeight: "600", color: "#cbd5e1", fontSize: "0.95rem" }}>
                  Vous avez déjà payé ? Entrez votre code :
                </label>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <input
                    type="text"
                    value={unlockCode}
                    onChange={(e) => {
                      setUnlockCode(e.target.value.toUpperCase());
                      setCodeError("");
                    }}
                    placeholder="Ex: COACH2026"
                    style={{ 
                      flex: 1,
                      textTransform: "uppercase",
                      fontFamily: "'SF Mono', monospace",
                      fontSize: "1rem",
                      fontWeight: "600",
                    }}
                  />
                  <button
                    onClick={handleUnlockCode}
                    style={{
                      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      color: "white",
                      padding: "1rem 1.5rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Débloquer
                  </button>
                </div>
                {codeError && (
                  <p style={{ 
                    marginTop: "0.75rem", 
                    color: "#fca5a5", 
                    fontSize: "0.9rem",
                    background: "rgba(220, 38, 38, 0.1)",
                    padding: "0.75rem",
                    borderRadius: "8px",
                  }}>
                    ⚠️ {codeError}
                  </p>
                )}
              </div>

              {/* Contact */}
              <p style={{ fontSize: "0.9rem", color: "#94a3b8", marginBottom: "2rem" }}>
                📧 Questions ? <a href="mailto:hello@coachpartner.app" style={{ color: "#60a5fa", textDecoration: "none" }}>hello@coachpartner.app</a>
              </p>

              <button
                onClick={() => {
                  setShowPaywall(false);
                  setUnlockCode("");
                  setCodeError("");
                }}
                style={{ background: "rgba(71, 85, 105, 0.8)", color: "#e2e8f0", width: "100%" }}
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* Mode Selection */}
        {mode === "choice" && phase === "input" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
            <div className="card mode-card" onClick={() => setMode("manual")}>
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✍️</div>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "0.75rem", fontWeight: "700" }}>
                Coller transcription
              </h2>
              <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
                Vous avez déjà une transcription de séance
              </p>
              <div style={{ marginTop: "1.5rem", color: "#60a5fa", fontWeight: "600" }}>
                Instantané →
              </div>
            </div>

            <div className="card mode-card" onClick={() => setMode("audio")}>
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎙️</div>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "0.75rem", fontWeight: "700" }}>
                Upload audio
              </h2>
              <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
                Transcription + analyse automatique
              </p>
              <div style={{ marginTop: "1.5rem", color: "#c084fc", fontWeight: "600" }}>
                Max 60 min →
              </div>
            </div>
          </div>
        )}

        {/* Manual Mode */}
        {mode === "manual" && phase === "input" && (
          <div className="card" style={{ padding: "3rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "2rem", fontWeight: "700" }}>
                📝 Transcription manuelle
              </h2>
              <button
                onClick={() => setMode("choice")}
                style={{ background: "rgba(71, 85, 105, 0.6)", color: "#e2e8f0", padding: "0.75rem 1.5rem" }}
              >
                ← Retour
              </button>
            </div>

            <textarea
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              placeholder={`Format attendu:

C: Bonjour ! Quel est votre objectif pour cette séance ?

Cl: Je souhaite travailler sur ma confiance en moi au travail.

C: D'accord. Sur une échelle de 1 à 10, où vous situez-vous aujourd'hui ?

...`}
              style={{ minHeight: "400px", fontFamily: "'SF Mono', monospace", fontSize: "0.9rem" }}
            />

            {error && (
              <div
                style={{
                  marginTop: "1.5rem",
                  padding: "1.25rem",
                  background: "rgba(220, 38, 38, 0.1)",
                  border: "2px solid rgba(220, 38, 38, 0.3)",
                  borderRadius: "12px",
                  color: "#fca5a5",
                  whiteSpace: "pre-line",
                }}
              >
                ⚠️ {error}
              </div>
            )}

            <div style={{ marginTop: "2rem", textAlign: "right" }}>
              <button
                onClick={() => analyzeTranscription()}
                disabled={analysesUsed >= 1}
                style={{
                  background: analysesUsed >= 1 
                    ? "rgba(71, 85, 105, 0.6)" 
                    : "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                  color: "white",
                  fontSize: "1.1rem",
                  padding: "1.25rem 3rem",
                }}
              >
                {analysesUsed >= 1 ? "🔒 Analyse gratuite utilisée" : "🔍 Analyser la séance"}
              </button>
            </div>
          </div>
        )}

        {/* Audio Mode */}
        {mode === "audio" && phase === "input" && (
          <div className="card" style={{ padding: "3rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "2rem", fontWeight: "700" }}>
                🎙️ Upload audio
              </h2>
              <button
                onClick={() => setMode("choice")}
                style={{ background: "rgba(71, 85, 105, 0.6)", color: "#e2e8f0", padding: "0.75rem 1.5rem" }}
              >
                ← Retour
              </button>
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <label style={{ display: "block", marginBottom: "0.75rem", fontWeight: "600", color: "#cbd5e1" }}>
                Fichier audio de la séance
              </label>
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioUpload}
                disabled={analysesUsed >= 1}
                style={{ padding: "1.5rem" }}
              />
              <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.5rem" }}>
                Formats acceptés : M4A, MP3, WAV, OGG • Max {MAX_AUDIO_DURATION_MINUTES} min • Max {MAX_FILE_SIZE_MB}MB
              </p>
            </div>

            {error && (
              <div
                style={{
                  padding: "1.25rem",
                  background: "rgba(220, 38, 38, 0.1)",
                  border: "2px solid rgba(220, 38, 38, 0.3)",
                  borderRadius: "12px",
                  color: "#fca5a5",
                  whiteSpace: "pre-line",
                }}
              >
                ⚠️ {error}
              </div>
            )}
          </div>
        )}

        {/* Processing Phase */}
        {(phase === "transcribing" || phase === "analyzing") && (
          <div className="card" style={{ padding: "4rem", textAlign: "center" }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                border: "6px solid rgba(96, 165, 250, 0.2)",
                borderTopColor: "#60a5fa",
                borderRadius: "50%",
                margin: "0 auto 2rem",
                animation: "spin 1s linear infinite",
              }}
            />
            <h2 style={{ fontSize: "2rem", marginBottom: "1rem", fontWeight: "700" }}>
              {progress.message}
            </h2>
            <div className="progress-bar" style={{ maxWidth: "400px", margin: "2rem auto" }}>
              <div className="progress-fill" style={{ width: `${progress.percent}%` }} />
            </div>
            <p style={{ color: "#94a3b8" }}>
              {phase === "transcribing" && "Conversion audio en texte..."}
              {phase === "analyzing" && "Évaluation des 8 compétences ICF"}
            </p>
          </div>
        )}

        {/* Results Phase */}
        {phase === "result" && analyse && (
          <div>
            <div className="no-print" style={{ marginBottom: "2rem", display: "flex", gap: "1rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button
                onClick={resetAll}
                style={{ background: "rgba(71, 85, 105, 0.8)", color: "#e2e8f0" }}
              >
                ← Nouvelle analyse
              </button>
              <button
                onClick={() => window.print()}
                style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "white" }}
              >
                🖨️ Imprimer
              </button>
            </div>

            {/* Synthèse */}
            <div className="card" style={{ padding: "3rem", marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "2.25rem", marginBottom: "1.5rem", fontWeight: "700" }}>
                📊 Synthèse globale
              </h2>
              <p style={{ fontSize: "1.1rem", lineHeight: "1.8", color: "#cbd5e1", marginBottom: "2rem" }}>
                {analyse.synthese}
              </p>

              {(analyse.duree_approximative || analyse.structure_globale) && (
                <div style={{ display: "flex", gap: "3rem", flexWrap: "wrap", paddingTop: "1.5rem", borderTop: "1px solid rgba(148, 163, 184, 0.2)" }}>
                  {analyse.duree_approximative && (
                    <div>
                      <span style={{ color: "#94a3b8", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Durée
                      </span>
                      <div style={{ fontSize: "1.25rem", fontWeight: "700", marginTop: "0.5rem" }}>
                        {analyse.duree_approximative}
                      </div>
                    </div>
                  )}
                  {analyse.structure_globale && (
                    <div style={{ flex: 1 }}>
                      <span style={{ color: "#94a3b8", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Structure
                      </span>
                      <div style={{ fontSize: "1rem", marginTop: "0.5rem", color: "#cbd5e1" }}>
                        {analyse.structure_globale}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Points forts / À développer */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "2rem", marginBottom: "2rem" }}>
              <div className="card" style={{ padding: "2.5rem" }}>
                <h2 style={{ fontSize: "1.75rem", marginBottom: "1.5rem", fontWeight: "700", color: "#10b981" }}>
                  ✨ Points forts
                </h2>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {analyse.pointsForts.map((point, i) => (
                    <li
                      key={i}
                      style={{
                        padding: "1.25rem",
                        marginBottom: "1rem",
                        background: "rgba(16, 185, 129, 0.08)",
                        border: "1px solid rgba(16, 185, 129, 0.25)",
                        borderRadius: "12px",
                        fontSize: "1rem",
                        lineHeight: "1.6",
                      }}
                    >
                      <span style={{ color: "#10b981", marginRight: "0.75rem", fontSize: "1.2rem" }}>✓</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card" style={{ padding: "2.5rem" }}>
                <h2 style={{ fontSize: "1.75rem", marginBottom: "1.5rem", fontWeight: "700", color: "#f59e0b" }}>
                  🎯 Axes de développement
                </h2>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {analyse.pointsADevelopper.map((point, i) => (
                    <li
                      key={i}
                      style={{
                        padding: "1.25rem",
                        marginBottom: "1rem",
                        background: "rgba(245, 158, 11, 0.08)",
                        border: "1px solid rgba(245, 158, 11, 0.25)",
                        borderRadius: "12px",
                        fontSize: "1rem",
                        lineHeight: "1.6",
                      }}
                    >
                      <span style={{ color: "#f59e0b", marginRight: "0.75rem", fontSize: "1.2rem" }}>→</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Compétences détaillées */}
            <div className="card" style={{ padding: "3rem" }}>
              <h2 style={{ fontSize: "2rem", marginBottom: "2.5rem", fontWeight: "700" }}>
                📋 Évaluation détaillée (8 compétences ICF)
              </h2>

              {analyse.competences.map((comp) => (
                <div key={comp.id} className="competence-card">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "1.25rem",
                      flexWrap: "wrap",
                      gap: "1rem",
                    }}
                  >
                    <h3 style={{ fontSize: "1.3rem", fontWeight: "700", margin: 0 }}>
                      {comp.id}. {comp.titre}
                    </h3>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.5rem 1.25rem",
                        borderRadius: "24px",
                        fontSize: "0.9rem",
                        fontWeight: "700",
                        letterSpacing: "0.02em",
                        background: NIVEAUX_COLORS[comp.niveau] || "#6b7280",
                        color: "white",
                      }}
                    >
                      {comp.niveau}
                    </span>
                  </div>

                  {comp.observations && (
                    <div style={{ marginBottom: "1.25rem" }}>
                      <strong style={{ color: "#94a3b8", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Observations
                      </strong>
                      <p style={{ marginTop: "0.75rem", fontSize: "1rem", lineHeight: "1.7", color: "#cbd5e1" }}>
                        {comp.observations}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: "3rem", padding: "2rem", textAlign: "center", color: "#64748b", fontSize: "0.9rem", borderTop: "1px solid rgba(148, 163, 184, 0.1)" }}>
              <p style={{ marginBottom: "0.5rem" }}>
                Rapport généré par <strong>CoachPartner</strong>
              </p>
              <p style={{ fontSize: "0.85rem", marginBottom: "1rem" }}>
                Référentiel ICF (8 compétences clés) • Analyse basée sur IA
              </p>
              <p style={{ fontSize: "0.8rem", color: "#475569", fontStyle: "italic" }}>
                Outil d'aide à l'analyse, ne remplace pas l'évaluation d'un mentor certifié ICF
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
