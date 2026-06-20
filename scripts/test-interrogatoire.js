import dotenv from 'dotenv';
import { fetchScenarioFromGemini } from '../src/services/scenarioGenerator.js';
import { generateSuspectReply } from '../src/services/interrogatoire.js';

dotenv.config();

async function main() {
  try {
    console.log('Génération d’un scénario pour le test d’interrogatoire...');
    const scenario = await fetchScenarioFromGemini();
    const suspect = scenario.suspects?.[0];
    if (!suspect) {
      throw new Error('Aucun suspect trouvé dans le scénario.');
    }

    console.log('Suspect sélectionné :', suspect.nom, `(${suspect.profession})`);
    console.log('Alibi valide :', suspect.alibi_valide);
    console.log('Secret :', suspect.secret);

    const reply = await generateSuspectReply({
      scenario,
      suspectId: suspect.id,
      history: [],
      message: 'Où étiez-vous la nuit du crime ?'
    });

    console.log('\nRéponse du suspect :');
    console.log(reply);
  } catch (error) {
    console.error('Erreur lors du test d’interrogatoire :');
    console.error(error);
    process.exit(1);
  }
}

main();
