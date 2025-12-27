require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// ══════════════════════════════════════════════════════════════
// CONFIGURATION DES APIs
// ══════════════════════════════════════════════════════════════

const APIs = {
    claude: {
        url: 'https://api.anthropic.com/v1/messages',
        key: process.env.ANTHROPIC_API_KEY,
        available: !!process.env.ANTHROPIC_API_KEY
    },
    openai: {
        url: 'https://api.openai.com/v1/chat/completions',
        key: process.env.OPENAI_API_KEY,
        available: !!process.env.OPENAI_API_KEY
    },
    perplexity: {
        url: 'https://api.perplexity.ai/chat/completions',
        key: process.env.PERPLEXITY_API_KEY,
        available: !!process.env.PERPLEXITY_API_KEY
    },
    gemini: {
        key: process.env.GEMINI_API_KEY,
        available: !!process.env.GEMINI_API_KEY
    }
};

// ══════════════════════════════════════════════════════════════
// FONCTIONS D'APPEL AUX APIs
// ══════════════════════════════════════════════════════════════

async function callClaude(prompt, maxTokens = 8192) {
    if (!APIs.claude.available) return { error: 'Claude non configuré - Ajoute ta clé ANTHROPIC_API_KEY dans le fichier .env' };
    
    try {
        const response = await fetch(APIs.claude.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': APIs.claude.key,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: maxTokens,
                messages: [{ role: 'user', content: prompt }]
            })
        });
        const data = await response.json();
        if (data.error) return { error: data.error.message };
        return { response: data.content[0].text };
    } catch (error) {
        return { error: error.message };
    }
}

async function callGPT(prompt, maxTokens = 8192) {
    if (!APIs.openai.available) return { error: 'GPT non configuré' };
    
    try {
        const response = await fetch(APIs.openai.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${APIs.openai.key}`
            },
            body: JSON.stringify({
                model: 'gpt-4-turbo-preview',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: maxTokens
            })
        });
        const data = await response.json();
        if (data.error) return { error: data.error.message };
        return { response: data.choices[0].message.content };
    } catch (error) {
        return { error: error.message };
    }
}

async function callPerplexity(prompt, maxTokens = 8192) {
    if (!APIs.perplexity.available) return { error: 'Perplexity non configuré' };
    
    try {
        const response = await fetch(APIs.perplexity.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${APIs.perplexity.key}`
            },
            body: JSON.stringify({
                model: 'llama-3.1-sonar-large-128k-online',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: maxTokens
            })
        });
        const data = await response.json();
        if (data.error) return { error: data.error.message };
        return { response: data.choices[0].message.content };
    } catch (error) {
        return { error: error.message };
    }
}

async function callGemini(prompt, maxTokens = 8192) {
    if (!APIs.gemini.available) return { error: 'Gemini non configuré' };
    
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${APIs.gemini.key}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { maxOutputTokens: maxTokens }
            })
        });
        const data = await response.json();
        if (data.error) return { error: data.error.message };
        return { response: data.candidates[0].content.parts[0].text };
    } catch (error) {
        return { error: error.message };
    }
}

// ══════════════════════════════════════════════════════════════
// CONSTRUCTION DU CONTEXTE PROFIL
// ══════════════════════════════════════════════════════════════

function buildProfileContext(profile) {
    if (!profile) return 'Profil non spécifié';

    const labels = {
        personality: {
            creative: 'créer/imaginer', manual: 'fabriquer de ses mains', technical: 'technique/précision',
            social: 'contact humain', organize: 'organiser/gérer', aesthetic: 'esthétique/beauté',
            solve: 'résoudre des problèmes', lead: 'diriger/décider'
        },
        environment: {
            office: 'bureau/ordinateur', workshop: 'atelier', site: 'chantiers', client: 'chez les clients',
            store: 'commerce/showroom', travel: 'en déplacement', independent: 'indépendante', varied: 'environnement varié'
        },
        priorities: {
            money: 'bien gagner sa vie', passion: 'vivre de sa passion', stability: 'stabilité de l\'emploi',
            freedom: 'liberté/autonomie', evolution: 'évolution rapide', balance: 'équilibre vie pro/perso',
            meaning: 'travail qui a du sens', prestige: 'reconnaissance sociale'
        },
        sectors: {
            interior: 'décoration intérieure', architecture: 'architecture', luxury: 'luxe/haut de gamme',
            events: 'événementiel', cinema: 'cinéma/audiovisuel', theater: 'spectacle/théâtre',
            museum: 'musées/expositions', retail: 'boutiques/retail', hotel: 'hôtellerie',
            boats: 'nautisme/yachts', 'real-estate': 'immobilier', furniture: 'meubles/ébénisterie',
            digital: 'numérique/3D/BIM', eco: 'éco-construction/durable', craft: 'artisanat d\'art', sales: 'commerce/vente'
        }
    };

    let context = `## PROFIL DE L'ÉTUDIANTE

**Diplôme** : Bac Pro ERA (Étude et Réalisation d'Agencement)
**Localisation** : ${profile.location || 'Saint-Chamond (42400)'}
**Région** : Auvergne-Rhône-Alpes (proche Lyon et Saint-Étienne)
**Mobilité** : ${profile.mobility === 'local' ? 'Proche uniquement (30 min)' : profile.mobility === 'regional' ? 'Région Auvergne-Rhône-Alpes' : profile.mobility === 'national' ? 'France entière' : 'International possible'}
**Durée d'études max** : ${profile.studyDuration || 2} an(s) après le bac
**Alternance** : ${profile.alternance === 'yes' ? 'Préférée' : profile.alternance === 'no' ? 'Non souhaitée' : 'Ouverte'}`;

    if (profile.personality?.length > 0) {
        context += `\n**Ce qu'elle aime** : ${profile.personality.map(p => labels.personality[p] || p).join(', ')}`;
    }
    if (profile.environment?.length > 0) {
        context += `\n**Environnement souhaité** : ${profile.environment.map(e => labels.environment[e] || e).join(', ')}`;
    }
    if (profile.priorities?.length > 0) {
        context += `\n**Priorités** : ${profile.priorities.map(p => labels.priorities[p] || p).join(', ')}`;
    }
    if (profile.sectors?.length > 0) {
        context += `\n**Secteurs d'intérêt** : ${profile.sectors.map(s => labels.sectors[s] || s).join(', ')}`;
    }
    if (profile.dream) {
        context += `\n**Rêves/aspirations** : ${profile.dream}`;
    }

    return context;
}

// ══════════════════════════════════════════════════════════════
// ROUTE PRINCIPALE : EXPLORATION ORCHESTRÉE
// ══════════════════════════════════════════════════════════════

app.post('/api/explore', async (req, res) => {
    const { profile } = req.body;
    
    console.log('\n🚀 ══════════════════════════════════════════════════════');
    console.log('   EXPLORATION LANCÉE');
    console.log('══════════════════════════════════════════════════════════\n');
    
    const results = {
        phase1: null,
        phase2_claude: null,
        phase2_gpt: null,
        synthesis: null,
        errors: []
    };

    const profileContext = buildProfileContext(profile);
    const location = profile.location || 'Saint-Chamond (42400)';

    // ════════════════════════════════════════════════════════
    // PHASE 1 : RECHERCHE WEB (Perplexity)
    // ════════════════════════════════════════════════════════
    console.log('📡 PHASE 1 : Recherche des données actuelles...');
    
    const phase1Prompt = `Tu es un assistant de recherche spécialisé en orientation scolaire. 

CONTEXTE : Une étudiante en Bac Pro ERA (Étude et Réalisation d'Agencement) cherche ses possibilités d'études.
LOCALISATION : ${location} - Région Auvergne-Rhône-Alpes (proche Lyon et Saint-Étienne)

RECHERCHE CES INFORMATIONS ACTUELLES :

## 1. FORMATIONS DANS LA RÉGION (Lyon, Saint-Étienne, Auvergne-Rhône-Alpes)

**BTS accessibles aux Bac Pro ERA :**
- BTS ERA (Étude et Réalisation d'Agencement)
- BTS Aménagement Finition
- BTS Design d'Espace (si encore existant)
- BTS SCBH (Systèmes Constructifs Bois et Habitat)
- Autres BTS pertinents

Pour chaque formation : nom des lycées/CFA, ville, alternance possible ?

**Formations Bac+3 :**
- DN MADE mention Espace (lesquels acceptent les Bac Pro ?)
- BUT Génie Civil
- Licences Pro (agencement, bois, design, BTP)
- Bachelors reconnus

**Autres :**
- Compagnons du Devoir (maison de Lyon)
- CFA spécialisés

## 2. FORMATIONS SPÉCIALISÉES EN FRANCE

Cherche les formations pour les secteurs suivants (même si hors région) :
${profile.sectors?.length > 0 ? '- Secteurs d\'intérêt : ' + profile.sectors.join(', ') : '- Cinéma/décors, luxe, événementiel, nautisme, numérique/BIM'}

## 3. MÉTIERS D'AVENIR ET TENDANCES 2024-2025

- Quels métiers liés à l'agencement/design sont en croissance ?
- Impact du numérique (BIM, 3D, réalité virtuelle)
- Éco-construction et développement durable
- Nouveaux métiers émergents

## 4. DONNÉES PRATIQUES

- Calendrier Parcoursup 2025
- Salaires moyens par métier
- Taux d'insertion professionnelle

FORMAT : Donne des informations CONCRÈTES avec noms d'établissements, villes, et sources si possible.`;

    if (APIs.perplexity.available) {
        const phase1Result = await callPerplexity(phase1Prompt);
        results.phase1 = phase1Result.response || null;
        if (phase1Result.error) results.errors.push(`Perplexity: ${phase1Result.error}`);
        console.log('   ✓ Recherche web terminée');
    } else {
        results.errors.push('Perplexity non disponible - recherche web limitée');
        console.log('   ⚠ Perplexity non configuré');
    }

    // ════════════════════════════════════════════════════════
    // PHASE 2 : EXPLORATION DES MÉTIERS (Claude + GPT)
    // ════════════════════════════════════════════════════════
    console.log('🧠 PHASE 2 : Exploration des métiers...');

    const baseContext = `${profileContext}

${results.phase1 ? `
═══════════════════════════════════════════════════════════════
DONNÉES DE RECHERCHE (écoles et formations actuelles) :
═══════════════════════════════════════════════════════════════
${results.phase1}
═══════════════════════════════════════════════════════════════
` : ''}`;

    // PROMPT CLAUDE : Métiers structurés + potentiel d'avenir
    const promptClaude = `${baseContext}

Tu es un conseiller d'orientation expert. Ta mission : proposer des métiers avec un FORT POTENTIEL D'AVENIR.

Le Bac Pro ERA donne des compétences en :
- Lecture et création de plans (AutoCAD, SketchUp)
- Travail du bois et matériaux
- Conception d'espaces 3D
- Gestion de projet/chantier
- Sens de l'esthétique et des volumes

## CRITÈRES IMPORTANTS :
- ✅ Formations EN PRÉSENTIEL uniquement
- ✅ Diplômes RECONNUS (État ou RNCP)
- ✅ Focus sur les MÉTIERS D'AVENIR avec fort potentiel

═══════════════════════════════════════════════════════════════
PROPOSE CES CATÉGORIES DE MÉTIERS :
═══════════════════════════════════════════════════════════════

## A. MÉTIERS D'AVENIR À FORT POTENTIEL 🚀
Minimum 6 métiers qui vont se développer dans les 10 prochaines années :
- Liés au numérique (BIM, 3D, réalité virtuelle)
- Liés à l'éco-construction et au durable
- Liés aux nouvelles façons de vivre/travailler
- Liés à la rénovation énergétique

## B. MÉTIERS STABLES ET RECHERCHÉS 💼
Minimum 5 métiers classiques mais avec de bons débouchés :
- Où il y a de l'emploi
- Où les salaires sont corrects
- Où on peut évoluer

## C. MÉTIERS CRÉATIFS ET PASSIONNANTS 🎨
Minimum 4 métiers pour ceux qui veulent de la créativité :
- Design
- Décoration
- Scénographie
- Etc.

## D. MÉTIERS SURPRENANTS 🌟
Minimum 4 métiers auxquels on ne pense pas avec un Bac Pro ERA :
- Cinéma/spectacle
- Luxe
- Nautisme
- Événementiel
- Autres secteurs inattendus

## E. PARCOURS D'ÉTUDES
Pour les formations courtes (0-2 ans) et longues (3-5 ans)

═══════════════════════════════════════════════════════════════
FORMAT POUR CHAQUE MÉTIER :
═══════════════════════════════════════════════════════════════

**[NOM DU MÉTIER]** [emoji]
- 💡 Quoi : [description en 1-2 lignes]
- 📈 Avenir : [pourquoi ce métier a du potentiel]
- 📚 Formation : [diplôme + durée + alternance possible ?]
- 🏫 Où : [établissements, surtout en région si possible]
- 🎯 Chances d'admission : [Évalue les chances pour un Bac Pro ERA : Élevées ⭐⭐⭐ / Moyennes ⭐⭐ / Sélectives ⭐ + explication]
- 💰 Salaire : [débutant → confirmé]

## IMPORTANT SUR LES CHANCES D'ADMISSION :
- BTS ERA, BTS Aménagement : chances ÉLEVÉES ⭐⭐⭐ (formation naturelle)
- BTS Design/SCBH : chances MOYENNES ⭐⭐ (accessible avec bon dossier)
- DN MADE : chances SÉLECTIVES ⭐ (très demandé, portfolio requis)
- Licences Pro : MOYENNES à ÉLEVÉES selon spécialité
- Compagnons du Devoir : ÉLEVÉES (valorisent le Bac Pro)

Sois CONCIS et PRÉCIS. Pas de blabla.`;

    // PROMPT GPT : Créativité et métiers insolites
    const promptGPT = `${baseContext}

Tu es un CHASSEUR DE MÉTIERS D'AVENIR. Ta mission : trouver des métiers ORIGINAUX avec un FORT POTENTIEL.

═══════════════════════════════════════════════════════════════
CHERCHE DES MÉTIERS DANS CES DOMAINES ÉMERGENTS :
═══════════════════════════════════════════════════════════════

🖥️ **NUMÉRIQUE ET TECH**
- BIM Manager / Modeleur BIM
- Designer 3D / Visualisation architecturale
- Concepteur en réalité virtuelle/augmentée
- Level designer (jeux vidéo)
- Concepteur d'espaces virtuels (métavers)

🌿 **ÉCO-CONSTRUCTION ET DURABLE**
- Conseiller en rénovation énergétique
- Agenceur éco-responsable
- Spécialiste matériaux biosourcés
- Concepteur d'habitats durables

🎬 **CINÉMA, SPECTACLE, ÉVÉNEMENTIEL**
- Chef décorateur cinéma/TV
- Scénographe
- Constructeur de décors
- Designer d'expositions
- Concepteur de stands

💎 **LUXE ET HAUT DE GAMME**
- Visual merchandiser luxe
- Agenceur yachts/jets privés
- Designer d'intérieur hôtellerie de luxe
- Concepteur retail luxe

🏠 **NOUVEAUX MODES DE VIE**
- Home stager
- Space planner (optimisation d'espaces)
- Concepteur de tiny houses
- Aménageur de coworking/coliving

🎮 **AUTRES SECTEURS PORTEURS**
- Escape game designer
- Concepteur de showrooms
- Aménageur de food courts
- Designer de concept stores

═══════════════════════════════════════════════════════════════
POUR CHAQUE MÉTIER, DONNE :
═══════════════════════════════════════════════════════════════

**[NOM DU MÉTIER]** [emoji]
- Ce que c'est (2 lignes max)
- Pourquoi c'est un métier d'AVENIR
- Comment y accéder depuis un Bac Pro ERA
- 🎯 Chances d'admission : [Élevées ⭐⭐⭐ / Moyennes ⭐⭐ / Sélectives ⭐]
- Salaire estimé
- Un truc cool sur ce métier

Propose MINIMUM 12 métiers vraiment originaux et porteurs.
Ne répète pas les métiers classiques (agenceur, menuisier basique, etc.)`;

    // Appels en parallèle
    const [claudeResult, gptResult] = await Promise.all([
        callClaude(promptClaude),
        APIs.openai.available ? callGPT(promptGPT) : Promise.resolve({ error: 'GPT non configuré' })
    ]);

    results.phase2_claude = claudeResult.response || null;
    results.phase2_gpt = gptResult.response || null;
    
    if (claudeResult.error) results.errors.push(`Claude: ${claudeResult.error}`);
    if (gptResult.error && APIs.openai.available) results.errors.push(`GPT: ${gptResult.error}`);
    
    console.log('   ✓ Exploration des métiers terminée');

    // ════════════════════════════════════════════════════════
    // PHASE 3 : SYNTHÈSE FINALE (Claude)
    // ════════════════════════════════════════════════════════
    console.log('📝 PHASE 3 : Création du rapport de synthèse...');

    const synthesisPrompt = `Tu dois créer un RAPPORT DE SYNTHÈSE clair et actionnable pour une étudiante en Bac Pro ERA.

═══════════════════════════════════════════════════════════════
PROFIL
═══════════════════════════════════════════════════════════════
${profileContext}

═══════════════════════════════════════════════════════════════
DONNÉES COLLECTÉES
═══════════════════════════════════════════════════════════════

### Recherche web (écoles, tendances) :
${results.phase1 || 'Non disponible'}

### Analyse des métiers (structurée) :
${results.phase2_claude || 'Non disponible'}

### Métiers créatifs et originaux :
${results.phase2_gpt || 'Non disponible'}

═══════════════════════════════════════════════════════════════
CRÉE CE RAPPORT DE SYNTHÈSE
═══════════════════════════════════════════════════════════════

## 🎯 L'ESSENTIEL EN 5 LIGNES
Résumé de ce qu'il faut retenir pour cette étudiante.

## 🚀 TOP 5 : MÉTIERS D'AVENIR RECOMMANDÉS
Les 5 métiers avec le meilleur potentiel pour les 10 prochaines années, adaptés à son profil.

Pour chaque métier :
| Métier | Ce que c'est | Pourquoi c'est l'avenir | Formation | Chances admission | Salaire |
|--------|--------------|------------------------|-----------|-------------------|---------|
(Chances : ⭐⭐⭐ Élevées, ⭐⭐ Moyennes, ⭐ Sélectives)

## 🌟 5 MÉTIERS SURPRENANTS À DÉCOUVRIR
Des métiers originaux auxquels elle n'aurait pas pensé.

Même format tableau avec chances d'admission.

## 💼 5 MÉTIERS STABLES SI ELLE VEUT LA SÉCURITÉ
Des métiers classiques mais avec de bons débouchés.

Même format tableau avec chances d'admission.

## 📚 FORMATIONS RECOMMANDÉES

### Si elle veut travailler vite (Bac+2) :
- Liste des BTS et formations courtes
- Établissements dans sa région

### Si elle veut aller plus loin (Bac+3 à +5) :
- DN MADE, Licences Pro, écoles
- Où en France

## 🗺️ 3 PARCOURS POSSIBLES

**PARCOURS 1 : "Travailler vite et bien"**
Bac Pro ERA → [Formation courte] → [Métier] → [Évolution possible]

**PARCOURS 2 : "Métier d'avenir numérique"**
Bac Pro ERA → [Formation] → [Métier tech/BIM] → [Évolution]

**PARCOURS 3 : "Créativité et passion"**
Bac Pro ERA → [Formation design] → [Métier créatif] → [Évolution]

## 📝 COMMENT S'INSCRIRE

### Parcoursup (formations post-bac)
- **Quand** : Inscription janvier-mars, vœux jusqu'à mi-mars
- **Comment** : www.parcoursup.fr avec ton numéro INE
- **Conseils** : Soigne ta lettre de motivation, mets en avant ton Bac Pro ERA

### Hors Parcoursup
- **CFA et alternance** : Contacter directement les entreprises + CFA
- **Compagnons du Devoir** : Inscription sur compagnons-du-devoir.com
- **Écoles privées** : Dossier + entretien (attention aux dates)

### Documents à préparer
- Bulletins de 1ère et Terminale
- CV avec tes projets/stages ERA
- Portfolio de tes réalisations (photos de projets, dessins, plans)
- Lettre de motivation personnalisée par formation

## ⏰ CALENDRIER ET PROCHAINES ÉTAPES
- **Maintenant** : Explorer les formations, préparer ton portfolio
- **Novembre-Décembre** : Portes ouvertes des écoles
- **Janvier** : Ouverture Parcoursup
- **Mars** : Finaliser les vœux Parcoursup
- **Avril-Mai** : Réponses des formations
- **Été** : Chercher une alternance si besoin

═══════════════════════════════════════════════════════════════
RÈGLES DE RÉDACTION :
- CONCIS : Pas de blabla, que l'essentiel
- TABLEAUX : Utilise des tableaux pour comparer
- ACTIONNABLE : Des noms précis, des formations concrètes
- PERSONNALISÉ : Adapté à SON profil
═══════════════════════════════════════════════════════════════`;

    const synthesisResult = await callClaude(synthesisPrompt, 8192);
    results.synthesis = synthesisResult.response || null;
    if (synthesisResult.error) results.errors.push(`Synthèse: ${synthesisResult.error}`);
    
    console.log('   ✓ Rapport de synthèse terminé');
    console.log('\n✅ EXPLORATION TERMINÉE\n');

    res.json({
        success: true,
        synthesis: results.synthesis,
        details: {
            research: results.phase1,
            careers_structured: results.phase2_claude,
            careers_creative: results.phase2_gpt
        },
        errors: results.errors
    });
});

// ══════════════════════════════════════════════════════════════
// ROUTE CHAT : QUESTIONS DE SUIVI
// ══════════════════════════════════════════════════════════════

app.post('/api/chat', async (req, res) => {
    const { question, context } = req.body;
    
    console.log('💬 Question:', question);

    const chatPrompt = `Tu es un conseiller d'orientation expert et bienveillant pour une étudiante en Bac Pro ERA.

CONTEXTE :
- Elle habite à ${context?.profile?.location || 'Saint-Chamond (42400)'}
- Elle a déjà reçu un rapport d'orientation
- Elle pose une question de suivi

${context?.synthesis ? `Extrait du rapport précédent : ${context.synthesis.substring(0, 1500)}...` : ''}

SA QUESTION : ${question}

CONSIGNES :
- Réponds de manière CLAIRE et DIRECTE
- Si elle demande des infos sur un métier → donne des détails concrets
- Si elle demande des écoles → cherche dans sa région ET en France si besoin
- Si elle demande des précisions → développe
- Sois encourageante mais réaliste

Réponds de manière concise et utile.`;

    let result;
    if (APIs.claude.available) {
        result = await callClaude(chatPrompt, 4000);
    } else if (APIs.openai.available) {
        result = await callGPT(chatPrompt, 4000);
    } else {
        return res.json({ error: 'Aucune IA disponible' });
    }

    res.json({
        response: result.response || null,
        error: result.error || null
    });
});

// ══════════════════════════════════════════════════════════════
// ROUTE : RECHERCHE SPÉCIFIQUE
// ══════════════════════════════════════════════════════════════

app.post('/api/search', async (req, res) => {
    const { query, scope, profile } = req.body;
    
    console.log('🔍 Recherche:', query, '| Scope:', scope);

    const searchPrompt = `Recherche pour une étudiante en Bac Pro ERA.

RECHERCHE : "${query}"
SCOPE : ${scope === 'national' ? 'FRANCE ENTIÈRE' : scope === 'regional' ? 'Région Auvergne-Rhône-Alpes (Lyon, Saint-Étienne)' : 'Région prioritaire, puis France si nécessaire'}
LOCALISATION : ${profile?.location || 'Saint-Chamond (42400)'}

Trouve des informations CONCRÈTES :
1. Formations correspondantes (noms, établissements, villes)
2. Métiers liés
3. Conditions d'accès pour un Bac Pro ERA
4. Salaires
5. Potentiel d'avenir

Sois PRÉCIS : noms d'écoles, villes, chiffres. Pas de généralités.`;

    let result;
    if (APIs.perplexity.available) {
        result = await callPerplexity(searchPrompt);
    } else if (APIs.claude.available) {
        result = await callClaude(searchPrompt);
    } else {
        return res.json({ error: 'Aucune IA disponible' });
    }

    res.json({
        response: result.response || null,
        error: result.error || null
    });
});

// ══════════════════════════════════════════════════════════════
// ROUTE : STATUS DES APIs
// ══════════════════════════════════════════════════════════════

app.get('/api/status', (req, res) => {
    res.json({
        claude: APIs.claude.available,
        openai: APIs.openai.available,
        perplexity: APIs.perplexity.available,
        gemini: APIs.gemini.available
    });
});

// ══════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ══════════════════════════════════════════════════════════════

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ══════════════════════════════════════════════════════════════
// DÉMARRAGE DU SERVEUR
// ══════════════════════════════════════════════════════════════

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║  🎓 ORIENTATION BAC PRO ERA - Métiers d\'Avenir               ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║                                                              ║');
    console.log(`║  👉 Ouvre ton navigateur : http://localhost:${PORT}             ║`);
    console.log('║                                                              ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║  APIs configurées :                                          ║');
    console.log(`║  ${APIs.claude.available ? '✅' : '❌'} Claude (Anthropic) - Analyse & Synthèse              ║`);
    console.log(`║  ${APIs.openai.available ? '✅' : '❌'} GPT-4 (OpenAI) - Métiers créatifs                    ║`);
    console.log(`║  ${APIs.perplexity.available ? '✅' : '❌'} Perplexity - Recherche web temps réel              ║`);
    console.log(`║  ${APIs.gemini.available ? '✅' : '❌'} Gemini (Google) - Optionnel                          ║`);
    console.log('║                                                              ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');
});
