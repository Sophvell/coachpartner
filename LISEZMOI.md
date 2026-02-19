# 🎉 VOTRE REPO COACHPARTNER EST PRÊT !

## 📦 Contenu du dossier `coachpartner-repo`

Vous avez reçu un repo GitHub complet, prêt à déployer sur Vercel :

```
coachpartner-repo/
├── 📁 api/                     ← Backend Vercel Functions
│   ├── transcribe.js          (Whisper API sécurisée)
│   └── analyze.js             (Claude API sécurisée)
├── 📁 src/                     ← Frontend React
│   ├── App.jsx                (Application principale)
│   └── main.jsx               (Point d'entrée)
├── index.html                 ← Page HTML racine
├── package.json               ← Dépendances npm
├── vite.config.js             ← Config Vite
├── .gitignore                 ← Fichiers à ignorer
├── .env.example               ← Template variables d'env
├── README.md                  ← Documentation projet
└── DEPLOYMENT.md              ← 📘 GUIDE PAS-À-PAS (LISEZ-MOI EN PREMIER !)
```

---

## 🚀 COMMENT DÉPLOYER (3 ÉTAPES SIMPLES)

### ÉTAPE 1 : Upload sur GitHub (5 min)
1. Aller sur https://github.com/Sophvell/coachpartner
2. Supprimer l'ancien contenu (si présent)
3. Upload TOUS les fichiers du dossier `coachpartner-repo`
4. Commit

### ÉTAPE 2 : Créer les clés API (5 min)
1. **OpenAI** : https://platform.openai.com/api-keys → Create key
2. **Anthropic** : https://console.anthropic.com/settings/keys → Create key
3. **Sauvegarder** les 2 clés quelque part

### ÉTAPE 3 : Déployer sur Vercel (2 min)
1. Sur Vercel, vous êtes déjà sur "Import Project"
2. **Framework Preset** : Sélectionnez **Vite** (IMPORTANT !)
3. **Environment Variables** (avant de déployer !) :
   - Ajouter `OPENAI_API_KEY` = votre clé OpenAI
   - Ajouter `ANTHROPIC_API_KEY` = votre clé Anthropic
4. Cliquer **"Deploy"**
5. ⏳ Attendre 2 minutes
6. ✅ **TERMINÉ !** Votre site est en ligne !

---

## 📖 GUIDE DÉTAILLÉ

**Lisez le fichier `DEPLOYMENT.md`** pour les instructions étape par étape avec screenshots et troubleshooting.

---

## ✨ Fonctionnalités de votre MVP

- ✅ Upload audio (max 60 min, 25MB)
- ✅ Transcription automatique Whisper
- ✅ OU transcription manuelle (copier-coller)
- ✅ Analyse 8 compétences ICF
- ✅ Points forts / Axes de développement
- ✅ Export PDF / Impression
- ✅ Freemium : 1 analyse gratuite, puis 5€
- ✅ Protection coûts (limite 60 min audio)
- ✅ Terminologie ICF correcte (pas "CICOL" en public)
- ✅ Disclaimers légaux

---

## 🔑 Clés API à configurer

### OpenAI (Whisper)
- Créer sur : https://platform.openai.com/api-keys
- Budget recommandé : 30-50€/mois
- Coût : ~0,27€ par analyse (45 min audio)

### Anthropic (Claude)
- Créer sur : https://console.anthropic.com/settings/keys
- Budget recommandé : 20-30€/mois
- Coût : ~0,05€ par analyse

**Marge totale : 4,68€ par analyse (94%) 💰**

---

## 💰 Modèle Économique

```
Prix de vente : 5€
Coût Whisper : 0,27€ (45 min) à 0,36€ (60 min)
Coût Claude : 0,05€
───────────────────────────────────
Marge nette : 4,59€ - 4,68€ (92-94%)
```

**Break-even** : 5 analyses vendues (25€) → coûts API couverts pour le mois

---

## 🎯 Prochaines Actions (Plan 14 jours)

**Aujourd'hui (Jour 0)** :
- ✅ Domaine acheté : coachpartner.app
- ✅ Repo complet reçu
- ⏳ Déployer sur Vercel

**Demain (Jour 1)** :
- Tester avec vos propres séances
- Corriger bugs éventuels

**J2-J4** :
- Recruter 10 beta-testeurs (votre promo)
- Envoyer accès + collecter feedback

**J10 (Mercredi prochain)** :
- 🚀 LANCEMENT PUBLIC
- Posts LinkedIn/Facebook
- Email à tous vos contacts

**J14** :
- Objectif : 5 clients payants (25€)
- Bilan + décision pivot/scale

---

## 🆘 Support

**Problème technique ?**
1. Lire `DEPLOYMENT.md` (troubleshooting en bas)
2. Vérifier les variables d'environnement dans Vercel
3. Revenir me parler si bloqué

**Questions stratégiques ?**
- Revenez me voir pour :
  - Ajuster le pricing
  - Améliorer le produit
  - Stratégie marketing
  - Recrutement beta

---

## 📊 Checklist de Validation

Avant de dire "c'est fini", vérifiez :

- [ ] Tous les fichiers uploadés sur GitHub
- [ ] Variables d'environnement configurées (2 clés)
- [ ] Site déployé sur Vercel (URL .vercel.app)
- [ ] Test transcription manuelle → fonctionne
- [ ] Test upload audio → fonctionne
- [ ] Domaine custom configuré (coachpartner.app)
- [ ] Site accessible sur domaine (DNS propagés)

---

## 🎉 VOUS AVEZ TOUT !

Votre MVP professionnel est prêt à lancer.

**Temps estimé jusqu'au premier client** : 7-10 jours
**Budget total investi** : 12€ (domaine) + coûts API variables

**GO GO GO ! 🚀**

---

*Document créé le : 18 février 2026*  
*Version : 1.0 - MVP Production Ready*  
*Next : Déployer et recruter 10 beta-testeurs*
