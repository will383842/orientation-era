# 🎓 Orientation Bac Pro ERA - Métiers d'Avenir

Un outil intelligent pour découvrir TOUTES les possibilités après un Bac Pro ERA, avec un focus sur les métiers d'avenir à fort potentiel.

---

## 📦 INSTALLATION (10 minutes)

### Étape 1 : Installer Node.js

1. Va sur **https://nodejs.org/**
2. Télécharge la version **LTS** (le gros bouton vert)
3. Lance l'installation et clique "Suivant" partout
4. Redémarre ton ordinateur

### Étape 2 : Préparer le dossier

1. Décompresse le fichier ZIP
2. Tu obtiens un dossier `orientation-era`

### Étape 3 : Configurer les clés API

1. Dans le dossier `orientation-era`, trouve le fichier `.env.example`
2. **Copie** ce fichier et **renomme la copie** en `.env` (sans .example)
3. Ouvre le fichier `.env` avec le Bloc-notes
4. Remplace les `xxxxx` par tes vraies clés API

**Où obtenir les clés :**

| IA | Lien | Comment faire | Coût |
|---|---|---|---|
| **Claude** (obligatoire) | https://console.anthropic.com/ | Créer un compte → API Keys | ~5€ offerts |
| **GPT-4** (recommandé) | https://platform.openai.com/api-keys | Créer un compte → API Keys | ~5€ offerts |
| **Perplexity** (recommandé) | https://www.perplexity.ai/settings/api | Compte Pro → API | ~20$/mois |

⚠️ **Claude est obligatoire** pour la synthèse. Perplexity est très recommandé pour la recherche d'écoles.

### Étape 4 : Installer les dépendances

1. Ouvre **PowerShell** (ou Terminal sur Mac)
2. Tape ces commandes :

```bash
cd chemin/vers/orientation-era
npm install
```

(Remplace `chemin/vers/` par le vrai chemin vers ton dossier)

### Étape 5 : Lancer l'outil

```bash
npm start
```

Tu verras s'afficher :
```
🎓 ORIENTATION BAC PRO ERA - Métiers d'Avenir
👉 Ouvre ton navigateur : http://localhost:3000
```

### Étape 6 : Utiliser

1. Ouvre ton navigateur (Chrome, Firefox...)
2. Va sur **http://localhost:3000**
3. C'est prêt ! 🎉

---

## 🎯 COMMENT ÇA MARCHE

### Ta fille remplit le formulaire :
- Où elle habite
- Ce qu'elle aime faire
- Son environnement idéal
- Ses priorités
- Les secteurs qui l'attirent
- Ses rêves

### L'outil lance 3 phases automatiques :

```
PHASE 1 → Perplexity recherche les écoles et formations
          dans sa région (Lyon, Saint-Étienne...)
          
PHASE 2 → Claude + GPT explorent les métiers
          (classiques + originaux + métiers d'avenir)
          
PHASE 3 → Claude crée un rapport synthétique
          avec les TOP métiers et formations
```

### Elle reçoit :
- 🎯 **Synthèse** : TOP 5 métiers d'avenir, métiers surprenants, formations
- 📚 **Détails** : Tout le contenu des recherches
- 🔍 **Recherche** : Pour approfondir un sujet
- 💬 **Chat** : Pour poser des questions

---

## 🔍 RECHERCHE RÉGIONALE vs NATIONALE

- **Formations courantes** (BTS, Licence Pro) → Recherche d'abord dans la région
- **Formations spécialisées** (cinéma, luxe, nautisme) → Recherche en France entière
- **Recherche manuelle** → Elle peut choisir "Ma région" ou "France entière"

---

## 💡 EXEMPLES DE QUESTIONS À POSER DANS LE CHAT

- "Parle-moi plus du métier de BIM Manager"
- "Quelles écoles forment au design de luxe ?"
- "C'est quoi les Compagnons du Devoir ?"
- "Comment devenir décoratrice de cinéma ?"
- "Quelles sont les écoles de design à Lyon ?"

---

## 🆘 EN CAS DE PROBLÈME

### "npm n'est pas reconnu"
→ Node.js n'est pas installé ou pas dans le PATH
→ Réinstalle Node.js et redémarre ton ordi

### "Erreur: Claude non configuré"
→ Le fichier `.env` n'existe pas ou la clé est fausse
→ Vérifie que tu as bien créé `.env` (pas `.env.example`)
→ Vérifie que la clé commence par `sk-ant-`

### "Synthèse non disponible"
→ La clé Claude est obligatoire
→ Vérifie ta clé Anthropic

### L'outil est lent
→ C'est normal, les IA travaillent (30 sec à 2 min)
→ La recherche Perplexity prend du temps

---

## ⚠️ IMPORTANT

- Les informations sont générées par IA
- **Vérifie toujours** sur les sites officiels :
  - **Parcoursup** : https://www.parcoursup.fr
  - **ONISEP** : https://www.onisep.fr
  - **France Compétences** : https://www.francecompetences.fr
- Les salaires sont indicatifs
- Les formations évoluent chaque année

---

## 📁 CONTENU DU DOSSIER

```
orientation-era/
├── .env.example     ← Modèle pour les clés API
├── package.json     ← Configuration Node.js
├── server.js        ← Le serveur
├── README.md        ← Ce fichier
└── public/
    └── index.html   ← L'interface
```

---

## 🚀 POUR RELANCER L'OUTIL PLUS TARD

1. Ouvre PowerShell
2. Va dans le dossier : `cd chemin/vers/orientation-era`
3. Lance : `npm start`
4. Ouvre : http://localhost:3000

---

Bonne exploration ! 🎓✨
