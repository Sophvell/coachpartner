# 📘 GUIDE DE DÉPLOIEMENT VERCEL - ÉTAPE PAR ÉTAPE

## 🎯 Ce que vous allez faire

1. Uploader le code sur GitHub (5 min)
2. Connecter GitHub à Vercel (2 min)
3. Configurer les clés API (5 min)
4. Tester le site (2 min)
5. Configurer le domaine custom (10 min)

**Durée totale : 25 minutes**

---

## ÉTAPE 1 : Uploader sur GitHub (5 min)

### Option A : Via l'interface GitHub (RECOMMANDÉ - plus simple)

1. **Aller sur votre repo GitHub existant**
   - https://github.com/Sophvell/coachpartner

2. **Supprimer l'ancien contenu (si présent)**
   - Cliquer sur chaque fichier → ⋯ → Delete file
   - Ou créer un nouveau repo vide

3. **Upload tous les fichiers**
   - Cliquer "Add file" → "Upload files"
   - **Glisser-déposer TOUT le dossier `coachpartner-repo`**
   - Commit message : "Initial commit - MVP CoachPartner"
   - Cliquer "Commit changes"

**Fichiers à uploader** :
```
coachpartner-repo/
├── api/
│   ├── transcribe.js
│   └── analyze.js
├── src/
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
├── .gitignore
├── .env.example
└── README.md
```

✅ **Vérification** : Vous devriez voir tous ces fichiers sur GitHub

---

## ÉTAPE 2 : Import dans Vercel (2 min)

1. **Aller sur Vercel**
   - https://vercel.com
   - Log in (déjà fait)

2. **Import du projet**
   - Vous êtes actuellement sur cette page :
     "New Project" → "Import Git Repository"
   - Votre repo `Sophvell/coachpartner` devrait déjà être détecté
   - Si pas visible : cliquer "Adjust GitHub App Permissions"

3. **Configuration**
   - **Framework Preset** : **Vite** (IMPORTANT !)
   - **Root Directory** : `./` (laisser par défaut)
   - **Build Command** : Laissez vide (auto-détecté)
   - **Output Directory** : Laissez vide (auto-détecté)

4. **⚠️ NE PAS ENCORE CLIQUER "DEPLOY" !**
   - Avant de déployer, il faut configurer les variables d'environnement

---

## ÉTAPE 3 : Créer les Clés API (5 min)

### A. Créer clé OpenAI

1. Aller sur https://platform.openai.com/api-keys
2. Cliquer "Create new secret key"
3. Nom : "CoachPartner Production"
4. Permissions : "All" (par défaut)
5. **Copier la clé** (commence par `sk-proj-...`)
6. ⚠️ **La sauvegarder** quelque part (Notepad, etc.)

### B. Créer clé Anthropic

1. Aller sur https://console.anthropic.com/settings/keys
2. Cliquer "Create Key"
3. Nom : "CoachPartner Production"
4. **Copier la clé** (commence par `sk-ant-...`)
5. ⚠️ **La sauvegarder**

---

## ÉTAPE 4 : Configurer Variables d'Environnement Vercel (3 min)

**IMPORTANT : Faites ceci AVANT de déployer**

1. **Sur la page Vercel "New Project"**
   - Cliquer sur "Environment Variables" (section en bas)
   
2. **Ajouter la première variable**
   - Key : `OPENAI_API_KEY`
   - Value : (coller votre clé OpenAI `sk-proj-...`)
   - Environments : Cocher **Production**, **Preview**, et **Development**
   - Cliquer "Add"

3. **Ajouter la deuxième variable**
   - Key : `ANTHROPIC_API_KEY`
   - Value : (coller votre clé Anthropic `sk-ant-...`)
   - Environments : Cocher **Production**, **Preview**, et **Development**
   - Cliquer "Add"

✅ **Vérification** : Vous devriez voir 2 variables listées

---

## ÉTAPE 5 : DÉPLOYER ! (2 min)

1. **Maintenant cliquer sur "Deploy"**
   - En bas de la page
   
2. **Attendre le déploiement**
   - Barre de progression (30 secondes - 2 minutes)
   - Logs en temps réel
   
3. **✅ Success !**
   - Vous verrez "Congratulations!" 🎉
   - Un lien : `coachpartner.vercel.app` ou `coachpartner-xxx.vercel.app`

---

## ÉTAPE 6 : Tester le Site (5 min)

1. **Cliquer sur le lien du déploiement**
   - Ou "Visit" en haut à droite

2. **Tests à faire**

**Test 1 : Page d'accueil**
- ✅ Voir "CoachPartner" titre
- ✅ Voir 2 options (Transcription / Audio)

**Test 2 : Mode transcription manuelle**
- Cliquer "Coller transcription"
- Coller un exemple :
  ```
  C: Bonjour ! Quel est votre objectif pour cette séance ?
  Cl: Je souhaite améliorer ma communication.
  C: D'accord. Sur une échelle de 1 à 10, où êtes-vous ?
  Cl: Autour de 5.
  ```
- Cliquer "Analyser la séance"
- ⏳ Attendre 30-60 secondes
- ✅ Voir le rapport avec les 8 compétences

**Test 3 : Mode audio (optionnel)**
- Retour arrière
- Cliquer "Upload audio"
- Uploader un fichier audio court (30 sec - 2 min)
- ⏳ Attendre transcription + analyse
- ✅ Voir le rapport

**Si tout fonctionne** → 🎉 Votre app est LIVE !

**Si erreur** :
- Vérifier les variables d'environnement (Étape 4)
- Vérifier que les clés API sont correctes
- Redéployer : Dashboard → Deployments → ⋯ → Redeploy

---

## ÉTAPE 7 : Configurer Domaine Custom (10 min)

### A. Dans Vercel

1. **Aller dans Settings**
   - Votre projet → Settings → Domains

2. **Ajouter le domaine**
   - Cliquer "Add"
   - Entrer : `coachpartner.app`
   - Cliquer "Add"

3. **Copier les DNS**
   - Vercel va vous donner 2 types de records :
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
   - **Copier ces valeurs** (ou laisser l'onglet ouvert)

### B. Dans Namecheap

1. **Aller sur Namecheap**
   - Dashboard → Domain List
   - Cliquer "Manage" à côté de `coachpartner.app`

2. **Onglet "Advanced DNS"**
   - Supprimer tous les records existants (sauf NS records)

3. **Ajouter Record A**
   - Type : A Record
   - Host : @
   - Value : 76.76.21.21 (valeur donnée par Vercel)
   - TTL : Automatic

4. **Ajouter Record CNAME**
   - Type : CNAME Record
   - Host : www
   - Value : cname.vercel-dns.com (valeur donnée par Vercel)
   - TTL : Automatic

5. **Sauvegarder**
   - Cliquer "Save all changes"

### C. Attendre propagation (1-24h)

- Généralement 15 minutes - 2 heures
- Parfois jusqu'à 24h

**Vérifier propagation** :
- Aller sur https://dnschecker.org
- Entrer : coachpartner.app
- Voir si les DNS sont propagés (checkmarks verts)

**Une fois propagé** :
- Visiter https://coachpartner.app
- ✅ Votre site est accessible sur votre domaine !

---

## ✅ CHECKLIST FINALE

Avant de dire "c'est terminé", vérifiez :

- [ ] Code uploadé sur GitHub
- [ ] Projet importé dans Vercel
- [ ] Variables d'environnement configurées (2 clés)
- [ ] Site déployé et accessible (coachpartner.vercel.app)
- [ ] Test transcription manuelle fonctionne
- [ ] Test upload audio fonctionne
- [ ] Domaine custom configuré (coachpartner.app)
- [ ] DNS propagés (site accessible sur domaine custom)

---

## 🎉 FÉLICITATIONS !

Votre MVP CoachPartner est maintenant LIVE !

**Prochaines actions** :
1. Tester avec 2-3 de vos propres séances
2. Envoyer le lien à 5 personnes de votre promo (beta)
3. Collecter feedback
4. Itérer !

---

## 🆘 Problèmes Fréquents

### "Build failed" dans Vercel
→ Vérifier que Framework Preset = **Vite**
→ Vérifier que tous les fichiers sont bien uploadés sur GitHub

### "API error" lors de l'analyse
→ Vérifier les variables d'environnement (Settings → Environment Variables)
→ Vérifier que les clés API sont valides (tester sur OpenAI/Anthropic dashboard)
→ Redéployer après ajout variables

### "Transcription failed"
→ Vérifier que la clé OpenAI a du crédit (Settings → Billing)
→ Vérifier format audio supporté (M4A, MP3, WAV)

### Domaine ne fonctionne pas après 24h
→ Vérifier DNS sur dnschecker.org
→ Vérifier que les records A et CNAME sont corrects dans Namecheap
→ Essayer en navigation privée (cache navigateur)

---

**Besoin d'aide ? Revenez me voir ! 🚀**
