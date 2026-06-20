import fs from 'fs';

const env = fs.readFileSync(new URL('../.env', import.meta.url), 'utf8');
const apiKeyLine = env.split('\n').find((line) => line.startsWith('VITE_GEMINI_API_KEY='));
const apiKey = apiKeyLine?.split('=')[1]?.trim();

if (!apiKey) {
  throw new Error('Clé API dans .env introuvable');
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

const res = await fetch(url);
const body = await res.text();
console.log('STATUS', res.status, res.statusText);
console.log(body);
