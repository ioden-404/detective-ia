import { getStoredApiKey } from './apiKeyStore';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

const suspectSystemPrompt = `Tu es un suspect dans un jeu d'enquête policière de style années 40-50.
Tu incarnes intégralement ce personnage et tu dois répondre EN PERSONNAGE à la première personne.
Tes réponses doivent :
- être cohérentes avec ton nom, ton métier, ton mobile, ton alibi et ton secret.
- rester dans le contexte de l'enquête, sans inventer de détails en dehors du scénario.
- utiliser un tic de langage, une tournure personnelle ou un style distinctif.
- mentir de manière plausible si tu veux te défendre ou dissimuler quelque chose.
- ne jamais contredire un élément de l'enquête déjà établi.
- ne jamais mentionner que c'est un jeu, une IA, un prompt ou une interrogation technique.
- être brèves et directes, comme si tu étais interrogé par un inspecteur.
Réponds uniquement par du texte en français, sans markdown, sans backticks et sans explications supplémentaires.
`;

function getApiKey() {
  return getStoredApiKey() ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY);
}

function buildSystemPrompt(scenario, suspect) {
  return `${suspectSystemPrompt}
Voici le scénario complet du crime :
${JSON.stringify(scenario, null, 2)}

Tu es le suspect suivant :
${JSON.stringify(suspect, null, 2)}

Ta mission : reste en personnage, fais-lui croire à ton alibi, et si nécessaire, mens de façon cohérente sans te contredire.
Tu dois répondre aux questions du joueur en priorité et ne jamais proposer de nouveaux éléments d'enquête non demandés.`;
}

function buildUserPrompt(history, message) {
  const historyLines = history
    .map((entry) => (entry.role === 'player' ? `Joueur : ${entry.text}` : `Suspect : ${entry.text}`))
    .join('\n');

  return `Historique de la conversation :
${historyLines}

Nouvelle question du joueur :
${message}`;
}

export async function generateSuspectReply({ scenario, suspectId, history = [], message }) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('La clé API Gemini est manquante. Vérifie le fichier .env.');
  }

  const suspect = scenario?.suspects?.find((item) => item.id === suspectId);
  if (!suspect) {
    throw new Error('Suspect introuvable.');
  }

  const systemPrompt = buildSystemPrompt(scenario, suspect);
  const userPrompt = buildUserPrompt(history, message);

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
      generationConfig: { temperature: 0.8, maxOutputTokens: 1024 }
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Erreur Gemini interrogation : ${response.status} ${response.statusText} - ${body}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Réponse Gemini invalide pour l'interrogatoire.");
  }

  return text.trim();
}

export function buildVerdictNarrative({ scenario, accusedId }) {
  const accused = scenario?.suspects?.find((item) => item.id === accusedId);
  const culprit = scenario?.suspects?.find((item) => item.id === scenario.coupable_id);

  if (!accused || !culprit) {
    return `La vérité est encore cachée. Vous devez analyser le dossier avec plus de vigilance.`;
  }

  if (accusedId === scenario.coupable_id) {
    return `Vous aviez raison : ${culprit.nom} est bien le coupable. Sa rancune contre ${scenario.crime.victime} et son secret ${culprit.secret.toLowerCase()} le trahissent. L'arme et les indices du dossier pointent vers lui.`;
  }

  return `Vous vous êtes trompé en accusant ${accused.nom}. Le véritable coupable est toujours en liberté. Concentrez-vous sur la motivation, l'alibi et les preuves qui correspondent à ${culprit.nom}.`;
}

const verdictSystemPrompt = `Tu es le narrateur d'un jeu d'enquête policière de style film noir années 40-50.
Le joueur vient de rendre son verdict. Tu dois écrire le dénouement de l'affaire.
Ton style :
- Narration immersive, atmosphérique, comme une voix-off de film noir.
- Phrases courtes et percutantes mélangées à des descriptions d'ambiance.
- Tutoie le joueur (il est l'inspecteur).
- 4-6 phrases maximum, pas plus.
- Pas de markdown, pas de backticks, pas de guillemets autour du texte.
- Ne mentionne jamais que c'est un jeu ou une IA.
Réponds uniquement par le texte narratif en français.`;

export async function generateVerdictNarrative({ scenario, accusedId }) {
  const apiKey = getApiKey();
  if (!apiKey) {
    return buildVerdictNarrative({ scenario, accusedId });
  }

  const accused = scenario?.suspects?.find((item) => item.id === accusedId);
  const culprit = scenario?.suspects?.find((item) => item.id === scenario.coupable_id);
  if (!accused || !culprit) {
    return buildVerdictNarrative({ scenario, accusedId });
  }

  const isCorrect = accusedId === scenario.coupable_id;

  const userPrompt = `Voici le scénario complet :
${JSON.stringify(scenario, null, 2)}

Le joueur a accusé : ${accused.nom} (${accused.profession})
Le vrai coupable est : ${culprit.nom} (${culprit.profession})
Verdict : ${isCorrect ? 'CORRECT — le joueur a trouvé le coupable' : 'INCORRECT — le joueur s\'est trompé'}

Écris le dénouement narratif.`;

  try {
    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${verdictSystemPrompt}\n\n${userPrompt}` }] }],
        generationConfig: { temperature: 0.9, maxOutputTokens: 512 }
      })
    });

    if (!response.ok) {
      return buildVerdictNarrative({ scenario, accusedId });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text?.trim() || buildVerdictNarrative({ scenario, accusedId });
  } catch {
    return buildVerdictNarrative({ scenario, accusedId });
  }
}
