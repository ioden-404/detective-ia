import React from 'react';

export default function IntroView({ onStart }) {
  return (
    <section className="screen intro-screen">
      <div className="intro-panel">
        <div className="intro-card">
          <span className="case-title">Enquête ouverte</span>
          <h1>Detective IA</h1>
          <p className="intro-text">
            Plonge dans une enquête immersive où chaque indice est un fragment de vérité. Recrée un dossier, interroge des suspects et trouve le coupable.
          </p>
          <button className="primary-button" onClick={onStart}>Démarrer l'enquête</button>
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
