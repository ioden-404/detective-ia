import { getStoredApiKey } from './apiKeyStore';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

const systemPrompt = `LANGUE OBLIGATOIRE : tout le contenu JSON doit être en FRANÇAIS. Tous les noms, descriptions, mobiles, alibis, secrets doivent être en français.

Tu es un générateur de scénarios pour un jeu d'enquête mobile.
Réponds UNIQUEMENT par un objet JSON valide.
Ne fournis aucun texte explicatif, aucune phrase hors du JSON, aucun markdown ni backticks.
Le texte doit commencer par '{' et se terminer par '}'.
Ne coupe pas la réponse : génère une seule réponse JSON complète et valide.

Génère un scénario complet avec :
- Le crime (lieu, heure, victime, description en français)
- 4 suspects avec chacun un alibi textuel et une faille potentielle
- 6 pièces à conviction (type, emoji, titre, description immersive en français)
- Un identifiant coupable_id qui n'est jamais affiché directement

RÈGLES CRUCIALES POUR LES ALIBIS :
- Chaque suspect a un champ "alibi" (ce qu'il prétend) et un champ "alibi_faille" (la contradiction ou le mensonge dans son alibi, ou null si l'alibi est solide).
- TOUS les 4 suspects doivent avoir un alibi crédible en surface. Aucun suspect ne doit être "sans alibi".
- AU MOINS 3 suspects sur 4 doivent avoir une faille dans leur alibi (alibi_faille non null), y compris des innocents.
- Le coupable doit TOUJOURS avoir un alibi qui semble solide en surface mais dont la faille est subtile et liée aux preuves.
- Les innocents doivent aussi avoir des failles dans leurs alibis (fausses pistes) pour brouiller les pistes.
- Les failles doivent être découvrables via les preuves ou l'interrogatoire, pas évidentes.
- Il doit être IMPOSSIBLE de deviner le coupable en comparant les alibis. Seul le croisement des preuves, mobiles et interrogatoires permet de conclure.

RÈGLES POUR LES PREUVES :
- Parmi les 8 preuves, AU MOINS 3 doivent être directement liées aux alibis des suspects.
- Ces preuves-alibis doivent permettre au joueur de vérifier ou contredire ce que les suspects prétendent (ex: un ticket de caisse, une caméra de surveillance, un témoignage de voisin, un relevé téléphonique, un reçu de parking, etc.).
- Chaque preuve doit avoir un champ "lie_a" indiquant l'id du suspect concerné (ou null si la preuve est générale).
- Les preuves ne doivent pas dire explicitement "ceci prouve que X ment" — elles doivent donner un indice que le joueur doit recouper avec l'alibi du suspect.

Structure finale attendue :
{
  "crime": {"lieu": "...", "heure": "...", "victime": "...", "description": "..."},
  "suspects": [{"id": "s1", "nom": "...", "profession": "...", "mobile": "...", "alibi": "...", "alibi_faille": "..." ou null, "secret": "..."}],
  "preuves": [{"id": "p1", "type": "...", "emoji": "...", "titre": "...", "description": "...", "lie_a": "s1" ou null}],
  "coupable_id": "sX"
}

Utilise exactement 4 suspects et exactement 8 pièces à conviction.
Le scénario doit être cohérent, crédible et contenir des fausses pistes réalistes.
Le joueur ne doit PAS pouvoir deviner le coupable juste en regardant les alibis.`;

async function fetchScenarioFromGemini() {
  const prompt = `${systemPrompt}`;
  const apiKey = getStoredApiKey() ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY);

  if (!apiKey) {
    throw new Error('La clé API Gemini est manquante. Vérifie le fichier .env.');
  }

  const scenario = await retryAsync(
    () => sendGeminiRequest(prompt, apiKey),
    3,
    1000,
    [429, 500, 502, 503, 504]
  );

  const cleanedScenario = cleanGeminiResponse(scenario);

  try {
    const parsed = parseScenarioJson(cleanedScenario);
    validateScenario(parsed);
    return parsed;
  } catch (error) {
    throw new Error(`Impossible de parser le JSON du scénario : ${error.message}\nContenu reçu : ${cleanedScenario}`);
  }
}

function cleanGeminiResponse(text) {
  if (typeof text !== 'string') {
    return text;
  }

  let cleaned = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  cleaned = cleaned.replace(/^[^\{\[]+/, '');
  cleaned = cleaned.replace(/[^\}\]]+$/, '');
  cleaned = cleaned.replace(/\uFEFF/g, '');
  cleaned = cleaned.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]+/g, '');
  return cleaned.trim();
}

async function sendGeminiRequest(prompt, apiKey) {
  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.9, maxOutputTokens: 16384 }
    })
  });

  const responseText = await response.text();
  if (!response.ok) {
    throw new ApiError(response.status, response.statusText, responseText);
  }

  const data = JSON.parse(responseText);
  if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error('Réponse Gemini invalide : structure attendue manquante.');
  }

  return data.candidates[0].content.parts[0].text;
}

class ApiError extends Error {
  constructor(status, statusText, body) {
    super(`Erreur API Gemini : ${status} ${statusText} - ${body}`);
    this.status = status;
    this.body = body;
  }
}

async function retryAsync(fn, retries, delayMs, retryStatusCodes = []) {
  let attempt = 0;
  let lastError;

  while (attempt <= retries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const status = error?.status;
      const isRetryable =
        error instanceof ApiError
          ? retryStatusCodes.includes(status)
          : error.name === 'FetchError' || error.message?.includes('network');

      if (attempt === retries || !isRetryable) {
        throw lastError;
      }

      const backoff = delayMs * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, backoff));
      attempt += 1;
    }
  }

  throw lastError;
}

function parseScenarioJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    // Si Gemini renvoie du texte supplémentaire ou des retours chariot non validés,
    // on tente d'extraire le premier objet JSON complet.
  }

  const start = text.indexOf('{');
  if (start === -1) {
    throw new Error('Aucune ouverture d’objet JSON trouvée dans le texte reçu.');
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i += 1) {
    const ch = text[i];

    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) {
      continue;
    }
    if (ch === '{') {
      depth += 1;
      continue;
    }
    if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        const candidate = text.slice(start, i + 1);
        try {
          return JSON.parse(candidate);
        } catch {
          // continuer pour trouver la prochaine fin d'objet valide
        }
      }
    }
  }

  throw new Error('Impossible d’extraire un objet JSON complet du texte reçu.');
}

function validateScenario(scenario) {
  if (typeof scenario !== 'object' || scenario === null) {
    throw new Error('Le scénario doit être un objet JSON.');
  }

  const { crime, suspects, preuves, coupable_id } = scenario;
  if (!crime || typeof crime !== 'object') {
    throw new Error('Le scénario doit contenir un objet crime.');
  }
  if (!Array.isArray(suspects) || suspects.length !== 4) {
    throw new Error('Le scénario doit contenir exactement 4 suspects.');
  }
  if (!Array.isArray(preuves) || preuves.length < 6) {
    throw new Error('Le scénario doit contenir au moins 6 pièces à conviction.');
  }
  if (typeof coupable_id !== 'string' || !coupable_id) {
    throw new Error('Le scénario doit contenir un coupable_id valide.');
  }

  suspects.forEach((suspect, index) => {
    if (!suspect?.id || !suspect?.nom || !suspect?.profession || !suspect?.alibi || !suspect?.secret) {
      throw new Error(`Le suspect #${index + 1} doit contenir id, nom, profession, alibi et secret.`);
    }
  });

  preuves.forEach((preuve, index) => {
    if (!preuve?.id || !preuve?.type || !preuve?.emoji || !preuve?.titre || !preuve?.description) {
      throw new Error(`La preuve #${index + 1} doit contenir id, type, emoji, titre et description.`);
    }
  });
}

export { fetchScenarioFromGemini, validateScenario };
