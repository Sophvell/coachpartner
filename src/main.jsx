import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```
4. **Commit** (en bas : "Commit new file")

### Étape 2 : Déplacer App.jsx dans src/

1. Cliquer sur **App.jsx** (celui à la racine)
2. Copier TOUT le contenu (Ctrl+A, Ctrl+C)
3. Retour → **Add file** → **Create new file**
4. Nom : `src/App.jsx`
5. Coller le contenu
6. **Commit**

### Étape 3 : Créer le dossier `api`

1. **Add file** → **Create new file**
2. Nom : `api/transcribe.js`
3. Cliquer sur **transcribe.js** (celui à la racine)
4. Copier tout le contenu
5. Retour, coller dans `api/transcribe.js`
6. **Commit**

### Étape 4 : Faire pareil pour analyze.js

1. **Add file** → **Create new file**
2. Nom : `api/analyze.js`
3. Copier le contenu de `analyze.js` (celui à la racine)
4. Coller dans `api/analyze.js`
5. **Commit**

### Étape 5 : Supprimer les anciens fichiers

Supprimer ces 4 fichiers à la racine (ils sont maintenant dans les bons dossiers) :
1. `App.jsx` (à la racine)
2. `main.jsx` (à la racine)
3. `analyze.js` (à la racine)
4. `transcribe.js` (à la racine)

Pour chaque fichier :
- Cliquer dessus
- Bouton **Delete file** (poubelle en haut à droite)
- Commit

---

## ✅ Résultat Final

Vous devriez voir :
```
coachpartner/
├── 📁 api/
│   ├── analyze.js
│   └── transcribe.js
├── 📁 src/
│   ├── App.jsx
│   └── main.jsx
├── DEPLOYMENT.md
├── GUIDE_PAIEMENT.md
├── LISEZMOI.md
├── README.md
├── index.html
├── package.json
├── preview-instructions.md
└── vite.config.js
