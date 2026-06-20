import React, { useEffect, useMemo, useState } from 'react';
import { fetchScenarioFromGemini } from './services/scenarioGenerator';
import { generateSuspectReply, buildVerdictNarrative, generateVerdictNarrative } from './services/interrogatoire';
import IntroView from './components/IntroView';
import HubView from './components/HubView';
import DossierView from './components/DossierView';
import InterrogatoireView from './components/InterrogatoireView';
import VerdictView from './components/VerdictView';

const SCREENS = {
  INTRO: 'intro',
  HUB: 'hub',
  DOSSIER: 'dossier',
  INTERROGATOIRE: 'interrogatoire',
  VERDICT: 'verdict'
};

function App() {
  const [screen, setScreen] = useState(SCREENS.INTRO);
  const [scenario, setScenario] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [selectedSuspect, setSelectedSuspect] = useState(null);
  const [chatHistory, setChatHistory] = useState({});
  const [isReplying, setIsReplying] = useState(false);
  const [accusation, setAccusation] = useState(null);
  const [notes, setNotes] = useState('');
  const [verdictNarrative, setVerdictNarrative] = useState('');
  const [verdictLoading, setVerdictLoading] = useState(false);
  const [screenTransition, setScreenTransition] = useState('');

  useEffect(() => {
    async function loadScenario() {
      setLoading(true);
      setError('');
      try {
        const gameScenario = await fetchScenarioFromGemini();
        setScenario(gameScenario);
        setScreen(SCREENS.HUB);
      } catch (err) {
        setError(err.message || 'Erreur inconnue lors de la génération du scénario.');
      } finally {
        setLoading(false);
      }
    }

    if (screen === SCREENS.HUB && !scenario) {
      loadScenario();
    }
  }, [screen, scenario]);

  const suspects = useMemo(() => scenario?.suspects || [], [scenario]);
  const evidences = useMemo(() => scenario?.preuves || [], [scenario]);

  const navigateTo = (target) => {
    setScreenTransition('exit');
    setTimeout(() => {
      setScreen(target);
      setScreenTransition('enter');
      setTimeout(() => setScreenTransition(''), 400);
    }, 250);
  };

  const handleStart = () => navigateTo(SCREENS.HUB);
  const handleOpenDossier = () => navigateTo(SCREENS.DOSSIER);
  const handleOpenInterrogatoire = () => navigateTo(SCREENS.INTERROGATOIRE);
  const handleOpenVerdict = () => navigateTo(SCREENS.VERDICT);
  const handleBackToHub = () => navigateTo(SCREENS.HUB);

  const handleSelectEvidence = (evidence) => setSelectedEvidence(evidence);
  const handleSelectSuspect = (suspect) => setSelectedSuspect(suspect);

  const handleSendMessage = async (message) => {
    if (!selectedSuspect || !scenario) return;

    const currentHistory = chatHistory[selectedSuspect.id] || [];
    const pendingHistory = [...currentHistory, { role: 'player', text: message }];
    setChatHistory((prev) => ({ ...prev, [selectedSuspect.id]: pendingHistory }));
    setIsReplying(true);

    try {
      const reply = await generateSuspectReply({ scenario, suspectId: selectedSuspect.id, history: currentHistory, message });
      const nextHistory = [...pendingHistory, { role: 'suspect', text: reply }];
      setChatHistory((prev) => ({ ...prev, [selectedSuspect.id]: nextHistory }));
    } catch (err) {
      setChatHistory((prev) => ({ ...prev, [selectedSuspect.id]: [...pendingHistory, { role: 'suspect', text: 'Le suspect ne répond pas pour le moment. Réessaie.' }] }));
    } finally {
      setIsReplying(false);
    }
  };

  const handleAccuse = async (suspectId) => {
    setAccusation(suspectId);
    setVerdictNarrative(buildVerdictNarrative({ scenario, accusedId: suspectId }));
    setVerdictLoading(true);
    navigateTo(SCREENS.VERDICT);

    try {
      const narrative = await generateVerdictNarrative({ scenario, accusedId: suspectId });
      setVerdictNarrative(narrative);
    } finally {
      setVerdictLoading(false);
    }
  };

  const handleRestart = () => {
    setScenario(null);
    setScreen(SCREENS.INTRO);
    setScreenTransition('');
    setSelectedEvidence(null);
    setSelectedSuspect(null);
    setChatHistory({});
    setAccusation(null);
    setNotes('');
    setVerdictNarrative('');
    setVerdictLoading(false);
    setError('');
  };

  const handleSendMessageWithEvidence = async (message, evidence) => {
    if (!selectedSuspect || !scenario) return;

    let fullMessage = message;
    if (evidence) {
      fullMessage = `[Le joueur présente la preuve : "${evidence.titre}" — ${evidence.description}]\n\n${message}`;
    }

    const currentHistory = chatHistory[selectedSuspect.id] || [];
    const displayText = evidence ? `${message}\n📎 Preuve présentée : ${evidence.titre}` : message;
    const pendingHistory = [...currentHistory, { role: 'player', text: displayText }];
    setChatHistory((prev) => ({ ...prev, [selectedSuspect.id]: pendingHistory }));
    setIsReplying(true);

    try {
      const reply = await generateSuspectReply({ scenario, suspectId: selectedSuspect.id, history: currentHistory, message: fullMessage });
      const nextHistory = [...pendingHistory, { role: 'suspect', text: reply }];
      setChatHistory((prev) => ({ ...prev, [selectedSuspect.id]: nextHistory }));
    } catch (err) {
      setChatHistory((prev) => ({ ...prev, [selectedSuspect.id]: [...pendingHistory, { role: 'suspect', text: 'Le suspect ne répond pas pour le moment. Réessaie.' }] }));
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <span className="brand">Detective IA</span>
          <p className="subtitle">Dossier criminel - enquête mobile</p>
        </div>
        <button className="top-action" onClick={handleBackToHub}>Accueil</button>
      </header>

      {loading && (
        <div className="status-panel loading-panel">
          <div className="spinner"></div>
          <span>Génération du scénario en cours…</span>
        </div>
      )}
      {error && <div className="status-panel error">{error}</div>}

      {!loading && !error && (
        <main className={`app-content ${screenTransition}`}>
          {screen === SCREENS.INTRO && <IntroView onStart={handleStart} />}
          {screen === SCREENS.HUB && scenario && (
            <HubView
              scenario={scenario}
              onOpenDossier={handleOpenDossier}
              onOpenInterrogatoire={handleOpenInterrogatoire}
              onOpenVerdict={handleOpenVerdict}
            />
          )}
          {screen === SCREENS.DOSSIER && scenario && (
            <DossierView
              scenario={scenario}
              selectedEvidence={selectedEvidence}
              onSelectEvidence={handleSelectEvidence}
              notes={notes}
              onNotesChange={setNotes}
              onBack={handleBackToHub}
            />
          )}
          {screen === SCREENS.INTERROGATOIRE && scenario && (
            <InterrogatoireView
              scenario={scenario}
              suspects={suspects}
              evidences={evidences}
              selectedSuspect={selectedSuspect}
              chatHistory={chatHistory[selectedSuspect?.id] || []}
              isReplying={isReplying}
              onSelectSuspect={handleSelectSuspect}
              onSendMessage={handleSendMessageWithEvidence}
              onAccuse={handleAccuse}
              onBack={handleBackToHub}
            />
          )}
          {screen === SCREENS.VERDICT && scenario && (
            <VerdictView
              scenario={scenario}
              accusation={accusation}
              narrative={verdictNarrative}
              narrativeLoading={verdictLoading}
              onBack={handleBackToHub}
              onRestart={handleRestart}
            />
          )}
        </main>
      )}
    </div>
  );
}

export default App;
