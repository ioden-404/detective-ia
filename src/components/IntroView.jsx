import React, { useState } from 'react';
import { getStoredApiKey, setStoredApiKey, hasApiKey } from '../services/apiKeyStore';

export default function IntroView({ onStart }) {
  const [apiKey, setApiKey] = useState(getStoredApiKey());
  const [showKey, setShowKey] = useState(false);
  const keyReady = apiKey.trim().length > 0;

  const handleStart = () => {
    setStoredApiKey(apiKey.trim());
    onStart();
  };

  return (
    <section className="screen intro-screen">
      <div className="intro-panel">
        <div className="intro-card">
          <span className="case-title">Enquête ouverte</span>
          <h1>Detective IA</h1>
          <p className="intro-text">
            Plonge dans une enquête immersive où chaque indice est un fragment de vérité. Recrée un dossier, interroge des suspects et trouve le coupable.
          </p>

          <div className="api-key-section">
            <label className="api-key-label" htmlFor="gemini-key">
              Clé API Gemini
            </label>
            <p className="api-key-hint">
              Nécessaire pour jouer. Obtiens-en une gratuitement sur Google AI Studio.
            </p>
            <div className="api-key-input-row">
              <input
                id="gemini-key"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="api-key-input"
              />
              <button
                type="button"
                className="api-key-toggle"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? '🙈' : '👁'}
              </button>
            </div>
            <p className="api-key-safe">
              Ta clé reste uniquement dans ton navigateur.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={handleStart}
            disabled={!keyReady}
          >
            Démarrer l'enquête
          </button>
        </div>

        <div className="intro-notes">
          <div className="note-card">
            <strong>Suspects</strong>
            <span>Analyse 4 profils.</span>
          </div>
          <div className="note-card">
            <strong>Preuves</strong>
            <span>Regroupe 6 indices.</span>
          </div>
          <div className="note-card">
            <strong>Verdict</strong>
            <span>Affirme ta décision.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
