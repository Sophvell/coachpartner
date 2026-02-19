# 💳 GUIDE SYSTÈME DE PAIEMENT - Payment Link + Codes

## 🎯 Comment ça marche

### Workflow utilisateur

```
Utilisateur fait 1 analyse gratuite ✅
    ↓
Veut faire une 2ème analyse
    ↓
Voit le PAYWALL MODAL :
┌─────────────────────────────────┐
│          ✨                      │
│  Vous avez aimé CoachPartner ?  │
│                                 │
│           5€                    │
│       par analyse               │
│                                 │
│  [💳 Payer 5€ maintenant]       │
│                                 │
│         ──── OU ────            │
│                                 │
│  Vous avez déjà payé ?          │
│  [Code: _______] [Débloquer]    │
│                                 │
└─────────────────────────────────┘
```

### Option 1 : Paiement immédiat
```
Clic sur "Payer 5€ maintenant"
    ↓
Nouvel onglet Stripe s'ouvre
    ↓
Utilisateur paie avec sa carte
    ↓
Stripe vous envoie email : "Paiement de user@email.com reçu"
    ↓
VOUS envoyez email à l'utilisateur avec le code
    ↓
L'utilisateur entre le code
    ↓
✅ Compteur reset, peut faire une nouvelle analyse
```

### Option 2 : Contact par email
```
Utilisateur vous contacte : hello@coachpartner.app
    ↓
Vous lui envoyez le lien Stripe Payment Link
    ↓
Il paie
    ↓
Vous lui donnez le code
    ↓
✅ Accès débloqué
```

---

## 🔧 SETUP : Créer votre Payment Link Stripe (5 min)

### Étape 1 : Créer compte Stripe (si pas déjà fait)

1. Aller sur https://stripe.com
2. Sign up (email + infos entreprise)
3. Activer compte (vérification identité sous 24h)
4. **Mode Test** disponible immédiatement

### Étape 2 : Créer le produit

1. **Dashboard Stripe** → **Products** → **Add product**

2. **Remplir les informations** :
   ```
   Name: Analyse CoachPartner
   Description: Analyse d'une séance de coaching selon le référentiel ICF
   Image: (optionnel)
   
   Pricing:
   - Price: 5.00 EUR
   - Billing: One time
   - Tax: (selon votre pays)
   ```

3. **Cliquer "Save product"**

### Étape 3 : Créer le Payment Link

1. En haut à droite du produit → **Create payment link**

2. **Configuration** :
   ```
   Quantity: Fixed (1)
   After payment: Show confirmation page
   Collect customer:
   - ✅ Email address (IMPORTANT !)
   - ☐ Shipping address (pas besoin)
   
   Description for customers:
   "Merci pour votre achat ! Vous allez recevoir votre code 
    de déblocage par email dans les 5 minutes."
   ```

3. **Cliquer "Create link"**

4. **COPIER LE LIEN** 
   ```
   Exemple: https://buy.stripe.com/test_xxxxxxxxxxxxx
   ou       https://buy.stripe.com/live_xxxxxxxxxxxxx
   ```

### Étape 4 : Intégrer le lien dans votre app

1. **Ouvrir le fichier** : `coachpartner-repo/src/App.jsx`

2. **Chercher la ligne** (vers ligne 550) :
   ```javascript
   onClick={() => window.open("VOTRE_LIEN_STRIPE_ICI", "_blank")}
   ```

3. **Remplacer** par votre vrai lien :
   ```javascript
   onClick={() => window.open("https://buy.stripe.com/test_xxxxx", "_blank")}
   ```

4. **Sauvegarder** et **commit** sur GitHub

5. **Vercel** redéploiera automatiquement (2 min)

✅ **C'est fait !** Le bouton "Payer 5€" fonctionne maintenant.

---

## 🔑 GESTION DES CODES DE DÉBLOCAGE

### Codes par défaut inclus

Dans le code actuel, j'ai mis 3 codes valides :
```javascript
COACH2026
BETA50
PARTNER
```

### Comment ajouter vos propres codes

1. **Ouvrir** `src/App.jsx`

2. **Chercher** (vers ligne 40) :
   ```javascript
   const VALID_CODES = [
     "COACH2026",
     "BETA50",
     "PARTNER",
     // Ajoutez vos codes ici
   ];
   ```

3. **Ajouter vos codes** :
   ```javascript
   const VALID_CODES = [
     "COACH2026",
     "BETA50",
     "PARTNER",
     "MARIE2026",      // Code pour Marie
     "PROMO10",        // Code promo spécial
     "EARLYBIRD",      // Early adopters
     // etc.
   ];
   ```

4. **Sauvegarder** et **commit**

### Stratégie de codes recommandée

**Option A : Code unique par client**
```
Format: PRENOM+4CHIFFRES
Exemples: MARIE1234, PAUL5678

Avantages:
- Impossible à deviner
- Traçable (vous savez qui a utilisé quel code)

Inconvénients:
- Vous devez ajouter chaque code manuellement
```

**Option B : Codes génériques réutilisables** (RECOMMANDÉ POUR MVP)
```
Exemples: 
- BETA2026 (pour tous les beta-testeurs)
- EARLYBIRD (pour les 20 premiers)
- PROMO50 (pour une campagne)

Avantages:
- Simple, 1 code pour plusieurs personnes
- Facile à communiquer
- Pas de gestion manuelle

Inconvénients:
- Risque de partage (mais acceptable pour MVP)
```

**Mon conseil** : Commencez avec 3-5 codes génériques, vous passerez aux codes uniques plus tard si nécessaire.

---

## 📧 WORKFLOW APRÈS PAIEMENT

### 1. Vous recevez notification Stripe

**Email de Stripe** :
```
Subject: Payment succeeded for €5.00

Customer: user@example.com
Amount: €5.00
Product: Analyse CoachPartner
Date: 18 Feb 2026, 23:45
```

### 2. Vous envoyez le code au client

**Template email à envoyer** :
```
De: hello@coachpartner.app
À: user@example.com
Objet: Votre code CoachPartner 🎉

Bonjour,

Merci pour votre paiement !

Voici votre code de déblocage : BETA2026

Comment l'utiliser :
1. Retournez sur https://coachpartner.app
2. Cliquez sur le mode d'analyse souhaité
3. Quand le paywall apparaît, entrez le code
4. Cliquez "Débloquer"
5. Vous pouvez maintenant faire une nouvelle analyse !

Note : Ce code débloque UNE analyse. Pour en faire d'autres, 
il faudra racheter ou nous contacter pour un forfait.

Besoin d'aide ? Répondez à cet email.

Bonne analyse ! 🚀
L'équipe CoachPartner
```

### 3. Client utilise le code

```
1. Client retourne sur coachpartner.app
2. Clique pour faire une analyse
3. Paywall s'affiche
4. Entre le code dans le champ
5. Clic "Débloquer"
6. ✅ "Accès débloqué ! Vous pouvez faire une nouvelle analyse"
7. Compteur reset à 0
8. Peut analyser une nouvelle séance
```

---

## ⚙️ CONFIGURATION STRIPE RECOMMANDÉE

### Notifications Email

**Dans Stripe Dashboard** → **Settings** → **Emails**

Activer :
- ✅ Successful payments (vous recevez email à chaque paiement)
- ✅ Failed payments
- ☐ Customer receipts (géré manuellement par vous)

### Mode Test vs Live

**Pour les 2 premières semaines (TEST)** :
```
Mode: Test
Cartes de test: 4242 4242 4242 4242
Vous: Testez avec vos beta-testeurs gratuitement
```

**Quand vous êtes prêt (LIVE)** :
```
Mode: Live
1. Activer votre compte (vérification identité)
2. Basculer le toggle "Test/Live" en haut à droite
3. Recréer le Payment Link en mode Live
4. Mettre à jour le lien dans App.jsx
```

---

## 📊 SUIVI DES PAIEMENTS

### Dashboard Stripe

**Payments** → Voir tous les paiements
- Email du client
- Montant
- Date
- Statut

**Exports** :
- CSV de tous les paiements
- Pour votre comptabilité

### Votre propre tracking (optionnel)

**Google Sheet simple** :
```
| Date | Email | Code donné | Montant | Notes |
|------|-------|------------|---------|-------|
| 18/02| user@.| BETA2026   | 5€      | OK    |
```

---

## 💰 TARIFICATION & VARIANTES

### Prix actuel : 5€ par analyse

**Variantes possibles** :

**Pack 5 analyses** : 20€ (au lieu de 25€)
→ Créer un 2ème produit Stripe
→ Donner un code qui reset 5 fois

**Pack 10 analyses** : 35€ (au lieu de 50€)
→ Meilleure marge, clients fidélisés

**Abonnement mensuel** : 29€/mois (analyses illimitées)
→ Pour la semaine 3-4

---

## 🐛 PROBLÈMES COURANTS

### "Le code ne marche pas"

**Vérifications** :
1. Code bien en MAJUSCULES (automatique dans l'input)
2. Code existe dans `VALID_CODES`
3. Pas d'espaces avant/après (géré automatiquement)

**Solution** :
- Donner un nouveau code au client
- Ou ajouter son code dans la liste

### "J'ai payé mais pas reçu le code"

**Checklist** :
1. Vérifier spam/promotions
2. Vérifier Stripe Dashboard (paiement bien reçu ?)
3. Renvoyer le code manuellement
4. **SLA** : Répondre sous 2h max (24h weekend)

### "Le client a utilisé le code mais veut analyser une 2ème séance"

**Normal** : 1 code = 1 analyse

**Solutions** :
- Il rachète (5€)
- Vous lui donnez un code promo ponctuel
- Vous lui proposez un pack 5 ou 10

---

## 🚀 AMÉLIORATION SEMAINE PROCHAINE

Après vos retours clients, on peut ajouter :

**Niveau 2** (Semaine 3) :
- Pack 5/10 analyses
- Codes avec nombre d'utilisations limité
- Dashboard pour voir ses analyses passées

**Niveau 3** (Mois 2) :
- Authentification (email/password)
- Paiement intégré complet (webhook)
- Abonnements mensuels
- Historique complet

---

## ✅ CHECKLIST AVANT LANCEMENT

- [ ] Payment Link Stripe créé
- [ ] Lien intégré dans App.jsx (remplacer "VOTRE_LIEN_STRIPE_ICI")
- [ ] Codes de déblocage ajoutés (minimum 3)
- [ ] Email hello@coachpartner.app configuré
- [ ] Template email de réponse prêt
- [ ] Mode Test activé (pour les premiers tests)
- [ ] Testé le flow complet vous-même

---

## 🎯 WORKFLOW QUOTIDIEN (5 min/jour)

**Matin** :
1. Check emails Stripe (nouveaux paiements ?)
2. Envoyer codes aux clients (2 min par client)

**Soir** :
1. Vérifier questions clients
2. Mettre à jour votre tracking

**Temps total** : 5-10 min/jour pour 5-10 clients

---

## 📞 SUPPORT CLIENT

**Questions fréquentes à attendre** :

Q: "Je n'ai pas reçu mon code"
R: [Renvoyer le code + vérifier spam]

Q: "Le code ne marche pas"
R: [Vérifier orthographe, renvoyer nouveau code]

Q: "Je veux analyser 10 séances, vous faites un prix ?"
R: "Oui ! 35€ pour 10 analyses au lieu de 50€"

Q: "C'est sécurisé ?"
R: "Oui, paiement via Stripe (même système que Amazon/Uber)"

---

**Vous êtes prêt ! 🚀**

Prochaine étape : Déployer sur Vercel et tester !
