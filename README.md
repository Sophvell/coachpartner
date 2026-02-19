# 🚀 CoachPartner

Analysez vos séances de coaching selon le référentiel ICF en 2 minutes.

## ✨ Fonctionnalités

- 🎙️ Upload audio (max 60 min) avec transcription automatique Whisper
- ✍️ Ou coller transcription manuelle
- 📊 Analyse des 8 compétences clés ICF
- 💡 Feedforward actionnable
- 📄 Export PDF / Impression
- 🎁 Freemium : 1 analyse gratuite, puis 5€

## 🛠️ Stack Technique

- **Frontend** : React + Vite
- **Backend** : Vercel Serverless Functions
- **APIs** : OpenAI Whisper + Anthropic Claude Sonnet 4
- **Hébergement** : Vercel (gratuit)

## 📦 Installation Locale (Optionnel)

```bash
# Cloner le repo
git clone https://github.com/Sophvell/coachpartner.git
cd coachpartner

# Installer les dépendances
npm install

# Créer fichier .env
cp .env.example .env
# Puis éditer .env avec vos vraies clés API

# Lancer en dev
npm run dev
```

## 🚀 Déploiement sur Vercel

### 1. Prérequis

Créer vos clés API :
- **OpenAI** : https://platform.openai.com/api-keys
- **Anthropic** : https://console.anthropic.com/settings/keys

### 2. Import dans Vercel

1. Aller sur https://vercel.com
2. Cliquer "Add New..." → "Project"
3. Sélectionner ce repo GitHub
4. **Application Preset** : Vite
5. Cliquer "Deploy"

### 3. Configuration des Variables d'Environnement

Une fois le projet déployé :

1. Aller dans **Settings** → **Environment Variables**
2. Ajouter :
   ```
   OPENAI_API_KEY = sk-proj-xxxxxxxxxxxxx
   ANTHROPIC_API_KEY = sk-ant-xxxxxxxxxxxxx
   ```
3. Cliquer "Save"
4. **Redéployer** : Deployments → ⋯ → Redeploy

### 4. Configurer le Domaine Custom

1. Acheter domaine (ex: coachpartner.app sur Namecheap)
2. Dans Vercel : Settings → Domains → Add
3. Entrer `coachpartner.app`
4. Copier les DNS fournis par Vercel
5. Dans Namecheap : Advanced DNS → Coller les DNS
6. Attendre propagation (1-24h)

## 🔒 Sécurité

- ✅ Clés API stockées en variables d'environnement (jamais dans le code)
- ✅ Backend Vercel Serverless (pas d'exposition frontend)
- ✅ Validation durée audio (max 60 min)
- ✅ Validation taille fichier (max 25MB)
- ✅ Rate limiting (localStorage côté client)

## 💰 Coûts Estimés

| Service | Coût par analyse | Note |
|---------|------------------|------|
| Whisper | ~0,27€ (45 min) | Max 0,36€ (60 min) |
| Claude  | ~0,05€ | Analyse texte |
| **Total** | **~0,32€** | Marge : 4,68€ (94%) |

**Budget mensuel recommandé** :
- OpenAI : 30-50€/mois
- Anthropic : 20-30€/mois

## 📊 Modèle Freemium

- 1ère analyse : **Gratuite** ✨
- Analyses suivantes : **5€** chacune
- Compteur localStorage (simple pour MVP)

## 🛡️ Protection des Coûts

**Limite OpenAI Dashboard** :
- Hard limit : 50€/mois
- Soft limit : 30€/mois (alerte email)

**Validation frontend** :
- Durée audio < 60 min
- Taille fichier < 25MB
- Formats : M4A, MP3, WAV, OGG

## 📧 Support

Email : hello@coachpartner.app

## 📄 Licence

© 2026 CoachPartner. Tous droits réservés.

---

**Créé avec ❤️ pour les coachs en formation ICF**
