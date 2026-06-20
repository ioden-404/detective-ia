import dotenv from 'dotenv';
import { fetchScenarioFromGemini } from '../src/services/scenarioGenerator.js';

dotenv.config();

async function main() {
  try {
    console.log('Lancement du test de génération de scénario Gemini...');
    const scenario = await fetchScenarioFromGemini();
    console.log('Scénario généré avec succès :');
    console.log(JSON.stringify(scenario, null, 2));
  } catch (error) {
    console.error('Échec du test de génération :');
    console.error(error.message);
    process.exitCode = 1;
  }
}

main();
