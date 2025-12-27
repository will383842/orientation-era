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

async function callGPT(prompt, maxTokens = 4000) {
    if (!APIs.openai.available) return { error: 'GPT non configuré' };

    try {
        const response = await fetch(APIs.openai.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${APIs.openai.key}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: Math.min(maxTokens, 4000)
            })
        });
        const data = await response.json();
        if (data.error) return { error: data.error.message };
        return { response: data.choices[0].message.content };
    } catch (error) {
        return { error: error.message };
    }
}

async function callPerplexity(prompt, maxTokens = 4000) {
    if (!APIs.perplexity.available) return { error: 'Perplexity non configuré' };

    try {
        const response = await fetch(APIs.perplexity.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${APIs.perplexity.key}`
            },
            body: JSON.stringify({
                model: 'sonar',
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

Tu es un conseiller d'orientation expert en 2025. Ta mission : proposer des métiers avec un FORT POTENTIEL D'AVENIR en tenant compte de la RÉVOLUTION DE L'IA.

Le Bac Pro ERA donne des compétences en :
- Lecture et création de plans (AutoCAD, SketchUp)
- Travail du bois et matériaux
- Conception d'espaces 3D
- Gestion de projet/chantier
- Sens de l'esthétique et des volumes

## ⚠️ CONTEXTE CRUCIAL : L'IMPACT DE L'IA EN 2025-2035

L'Intelligence Artificielle transforme TOUS les métiers. Pour chaque métier proposé, tu dois évaluer :

**🟢 MÉTIERS RÉSISTANTS À L'IA (à privilégier) :**
- Travail MANUEL et physique (l'IA ne peut pas poser une cuisine)
- Contact HUMAIN fort (relation client, accompagnement)
- CRÉATIVITÉ complexe (design sur-mesure, artistique)
- Adaptation au TERRAIN (chaque chantier est unique)
- ARTISANAT d'excellence (savoir-faire irremplaçable)

**🟡 MÉTIERS QUI UTILISENT L'IA COMME OUTIL (très porteurs) :**
- BIM avec IA intégrée
- Design assisté par IA (Midjourney, DALL-E pour les concepts)
- Modélisation 3D augmentée
- Gestion de projet avec outils IA

**🔴 MÉTIERS À RISQUE (à éviter ou anticiper) :**
- Tâches répétitives de bureau
- Dessin technique basique (l'IA le fait déjà)
- Administration pure

## CRITÈRES IMPORTANTS :
- ✅ Formations EN PRÉSENTIEL uniquement
- ✅ Diplômes RECONNUS (État ou RNCP)
- ✅ Focus sur les MÉTIERS D'AVENIR avec fort potentiel
- ✅ Évaluer la RÉSISTANCE À L'IA de chaque métier
- ✅ Privilégier les métiers MANUELS, CRÉATIFS ou à fort CONTACT HUMAIN

═══════════════════════════════════════════════════════════════
PROPOSE CES CATÉGORIES DE MÉTIERS :
═══════════════════════════════════════════════════════════════

## A. MÉTIERS D'AVENIR À FORT POTENTIEL 🚀
Minimum 8 métiers qui vont EXPLOSER dans les 10 prochaines années :

**Numérique et Tech :**
- BIM Manager / BIM Modeleur (TRÈS demandé)
- Infographiste 3D / Visualiste architectural
- Concepteur en réalité virtuelle (VR) / augmentée (AR)
- Designer d'espaces virtuels (métavers, jeux vidéo)
- Technicien scan 3D / relevé numérique

**Éco-construction et Durabilité :**
- Conseiller en rénovation énergétique (MaPrimeRénov')
- Technicien en éco-matériaux (chanvre, bois, paille)
- Auditeur énergétique
- Coordinateur de chantier éco-responsable
- Spécialiste isolation thermique

**Nouvelles façons de vivre :**
- Concepteur de tiny houses / habitats alternatifs
- Aménageur d'espaces de coworking/coliving
- Designer d'espaces modulables / flexibles
- Space planner (optimisation d'espaces)

## B. MÉTIERS STABLES ET RECHERCHÉS 💼
Minimum 8 métiers classiques avec EXCELLENTS débouchés (pénurie de main d'œuvre) :

**Agencement et menuiserie :**
- Agenceur (le métier naturel après ERA)
- Menuisier agenceur
- Poseur de cuisines / salles de bain
- Installateur de dressing / rangements

**Construction et bâtiment :**
- Chef d'équipe agencement
- Conducteur de travaux TCE
- Métreur / Économiste de la construction
- Technicien bureau d'études

**Artisanat d'excellence :**
- Ébéniste
- Menuisier d'art
- Restaurateur de meubles anciens
- Marqueteur

## C. MÉTIERS CRÉATIFS ET PASSIONNANTS 🎨
Minimum 6 métiers pour les passionnés de création :

**Design d'espace :**
- Architecte d'intérieur (après études)
- Décorateur / Décoratrice d'intérieur
- Home stager (valorisation immobilière)
- Coloriste conseil

**Scénographie et événementiel :**
- Scénographe d'exposition
- Muséographe
- Designer d'événements
- Concepteur de stands / salons

**Retail et commercial :**
- Visual merchandiser
- Étalagiste
- Designer de vitrines
- Concepteur de flagship stores

## D. MÉTIERS SURPRENANTS ET INSOLITES 🌟
Minimum 6 métiers auxquels on ne pense JAMAIS avec un Bac Pro ERA :

**Cinéma et audiovisuel :**
- Chef décorateur cinéma/TV/pub
- Constructeur de décors (films, séries)
- Accessoiriste plateau
- Régisseur de plateau

**Spectacle vivant :**
- Scénographe de théâtre / opéra
- Technicien de spectacle
- Constructeur de décors de scène
- Machiniste

**Luxe et prestige :**
- Agenceur yachts et jets privés
- Décorateur hôtellerie de luxe
- Concepteur de boutiques de luxe
- Aménageur de résidences privées haut de gamme

**Loisirs et divertissement :**
- Escape game designer / constructeur
- Concepteur de parcs d'attractions
- Décorateur de restaurants thématiques
- Designer de concept stores originaux

**Nautisme :**
- Menuisier naval
- Agenceur de bateaux
- Aménageur de péniches habitables

## E. CHANGER DE VOIE : AUTRES DOMAINES ACCESSIBLES 🔄
Minimum 6 métiers dans des domaines COMPLÈTEMENT DIFFÉRENTS mais accessibles avec un Bac Pro :

**Commerce / Vente / Retail :**
- Conseiller de vente spécialisé (bricolage, déco, ameublement)
- Vendeur en showroom (cuisines, salles de bain)
- Commercial B2B (matériaux, équipements)
- Technico-commercial
- Responsable de rayon

**Social / Animation / Éducation :**
- Animateur socioculturel (BPJEPS)
- Éducateur spécialisé
- Moniteur éducateur
- Accompagnant éducatif et social (AES)
- Animateur périscolaire

**Santé / Paramédical :**
- Aide-soignant(e) (très demandé)
- Auxiliaire de puériculture
- Ambulancier
- Brancardier
- Assistant dentaire

**Sécurité / Protection :**
- Sapeur-pompier (professionnel ou volontaire)
- Agent de sécurité
- Gardien de la paix (Police nationale)
- Gendarme
- Agent de surveillance

**Armée / Défense :**
- Militaire du rang (Terre, Air, Marine)
- Gendarme adjoint volontaire
- Matelot de la flotte
- Spécialités techniques dans l'armée

**Fonction publique :**
- Adjoint administratif (concours catégorie C)
- Agent territorial
- Gardien de musée / médiateur culturel
- Agent des espaces verts

**Transport / Logistique :**
- Conducteur de bus/car
- Chauffeur-livreur
- Agent logistique
- Cariste / préparateur de commandes

**Métiers avec les animaux 🐾 :**
- Auxiliaire vétérinaire (ASV) - formation en alternance
- Soigneur animalier (parcs, zoos, refuges)
- Éducateur canin
- Toiletteur canin/félin
- Vendeur en animalerie
- Pet-sitter / Dog-sitter
- Agent cynophile de sécurité (avec chien)
- Palefrenier / Lad-jockey (chevaux)
- Assistant en clinique vétérinaire
- Comportementaliste animalier

Pour chaque métier : formation nécessaire, durée, salaire, évolutions possibles, établissements.

## F. PARCOURS D'ÉTUDES
Pour les formations courtes (0-2 ans) et longues (3-5 ans)

═══════════════════════════════════════════════════════════════
FORMAT POUR CHAQUE MÉTIER :
═══════════════════════════════════════════════════════════════

**[NOM DU MÉTIER]** [emoji]
- 💡 Quoi : [description en 1-2 lignes]
- 📈 Avenir : [pourquoi ce métier a du potentiel]
- 🤖 Résistance IA : [🟢 Fort / 🟡 Utilise l'IA / 🔴 À risque] + explication courte
- 📚 Formation : [diplôme + durée + alternance possible ?]
- 🏫 Où : [établissements, surtout en région si possible]
- 🎯 Chances d'admission : [Élevées ⭐⭐⭐ / Moyennes ⭐⭐ / Sélectives ⭐ + explication]
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

Tu es un CHASSEUR DE MÉTIERS D'AVENIR. Ta mission : trouver des métiers ORIGINAUX avec un FORT POTENTIEL face à l'évolution de l'IA.

## ⚠️ CONTEXTE CRUCIAL : L'IA TRANSFORME TOUT

Privilégie les métiers qui RÉSISTENT ou TIRENT PROFIT de l'IA :
- 🟢 **RÉSISTANTS** : Travail manuel, contact humain, créativité sur-mesure, intervention terrain
- 🟡 **UTILISENT L'IA** : Métiers augmentés par l'IA (design assisté, BIM intelligent)
- 🔴 **À ÉVITER** : Tâches répétitives, dessin technique basique, administration pure

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
- Créateur de décors pour influenceurs/studios photo
- Aménageur de van/camping-car

🐾 **MÉTIERS AVEC LES ANIMAUX** (si elle aime les animaux)
- Auxiliaire vétérinaire (ASV)
- Soigneur animalier (zoos, parcs, refuges)
- Éducateur canin
- Toiletteur
- Agent cynophile de sécurité

💼 **RECONVERSION TOTALE POSSIBLE**
Mentionne aussi qu'elle peut se réorienter vers :
- Commerce/vente (ses compétences techniques sont un atout)
- Social/animation (BPJEPS, éducateur)
- Santé (aide-soignante, auxiliaire)
- Sécurité/Armée/Police (concours accessibles)
- Fonction publique (concours catégorie C)

═══════════════════════════════════════════════════════════════
POUR CHAQUE MÉTIER, DONNE DES INFOS COMPLÈTES :
═══════════════════════════════════════════════════════════════

**[NOM DU MÉTIER]** [emoji]
- 💡 **C'est quoi** : description claire en 2-3 lignes
- 📈 **Pourquoi c'est l'avenir** : tendances, demande, croissance
- 🤖 **Résistance IA** : [🟢 Fort / 🟡 Utilise l'IA / 🔴 À risque] + pourquoi
- 🎓 **Formation** : diplôme exact + durée + alternance possible ?
- 🏫 **Où se former** : établissements (surtout région Auvergne-Rhône-Alpes si possible)
- 🎯 **Chances d'admission Bac Pro ERA** : Élevées ⭐⭐⭐ / Moyennes ⭐⭐ / Sélectives ⭐ + explication
- 💰 **Salaire** : débutant → 5 ans → confirmé
- ✨ **Le + cool** : un truc motivant sur ce métier
- 📍 **Débouchés** : types d'employeurs, régions qui recrutent

Propose MINIMUM 15 métiers vraiment originaux et porteurs.
Sois PRÉCIS : noms d'écoles, villes, chiffres concrets.
Ne répète pas les métiers classiques (agenceur basique, menuisier standard, etc.)`;

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
Résumé de ce qu'il faut retenir pour cette étudiante, notamment face à l'évolution de l'IA.

## ⚠️ CONSEIL CRUCIAL SUR L'IA
En 3 lignes max : pourquoi privilégier les métiers résistants à l'IA (manuel, humain, créatif, terrain).

## 🚀 TOP 5 : MÉTIERS D'AVENIR RECOMMANDÉS
Les 5 métiers avec le meilleur potentiel pour les 10 prochaines années, RÉSISTANTS à l'IA.

Pour chaque métier :
| Métier | Ce que c'est | Résistance IA | Formation | Chances admission | Salaire |
|--------|--------------|---------------|-----------|-------------------|---------|
(Résistance : 🟢 Fort, 🟡 Utilise IA, 🔴 Risque | Chances : ⭐⭐⭐ Élevées, ⭐⭐ Moyennes, ⭐ Sélectives)

## 🌟 5 MÉTIERS SURPRENANTS À DÉCOUVRIR
Des métiers originaux auxquels elle n'aurait pas pensé (avec bonne résistance IA).

| Métier | Ce que c'est | Résistance IA | Formation | Chances admission | Salaire |
|--------|--------------|---------------|-----------|-------------------|---------|

## 💼 5 MÉTIERS STABLES SI ELLE VEUT LA SÉCURITÉ
Des métiers classiques mais avec de bons débouchés ET résistants à l'IA.

| Métier | Ce que c'est | Résistance IA | Formation | Chances admission | Salaire |
|--------|--------------|---------------|-----------|-------------------|---------|

## 🔄 CHANGER COMPLÈTEMENT DE VOIE : 6 AUTRES DOMAINES
Si elle veut faire TOTALEMENT autre chose, voici les options accessibles avec son Bac Pro :

**Commerce / Vente** (valorise ses compétences techniques) :
| Métier | Formation | Durée | Salaire |
|--------|-----------|-------|---------|

**Social / Animation / Éducation** :
| Métier | Formation | Durée | Salaire |
|--------|-----------|-------|---------|

**Santé / Paramédical** (secteur qui recrute +++) :
| Métier | Formation | Durée | Salaire |
|--------|-----------|-------|---------|

**Sécurité / Armée / Fonction publique** :
| Métier | Formation | Durée | Salaire |
|--------|-----------|-------|---------|

**Transport / Logistique** :
| Métier | Formation | Durée | Salaire |
|--------|-----------|-------|---------|

**Métiers avec les animaux 🐾** (si elle aime les animaux) :
| Métier | Formation | Durée | Salaire |
|--------|-----------|-------|---------|
(Auxiliaire vétérinaire, soigneur animalier, éducateur canin, toiletteur, etc.)

IMPORTANT : Montre-lui qu'elle n'est PAS enfermée et peut se réorienter totalement si elle le souhaite. Le Bac Pro est un TREMPLIN, pas une prison !

## 📚 FORMATIONS RECOMMANDÉES

### Si elle veut travailler vite (Bac+2) :
- Liste des BTS et formations courtes
- Établissements dans sa région

### Si elle veut aller plus loin (Bac+3 à +5) :
- DN MADE, Licences Pro, écoles
- Où en France

## 🗺️ 4 PARCOURS POSSIBLES (tous résistants à l'IA)

**PARCOURS 1 : "Travailler vite et bien" 🟢**
Bac Pro ERA → [Formation courte] → [Métier MANUEL] → [Évolution possible]
*Résistance IA : FORTE (travail de terrain, chaque chantier est unique)*

**PARCOURS 2 : "Métier d'avenir numérique" 🟡**
Bac Pro ERA → [Formation] → [Métier tech/BIM AUGMENTÉ par l'IA] → [Évolution]
*Résistance IA : UTILISE L'IA comme outil, pas remplacé par elle*

**PARCOURS 3 : "Créativité et passion" 🟢**
Bac Pro ERA → [Formation design] → [Métier créatif SUR-MESURE] → [Évolution]
*Résistance IA : FORTE (créativité humaine irremplaçable)*

**PARCOURS 4 : "Changer complètement de voie" 🟢**
Bac Pro ERA → [Formation dans un autre domaine] → [Nouveau métier] → [Évolution]
(Commerce/vente, social/animation, santé, sécurité/armée - tous à FORT contact humain)

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
