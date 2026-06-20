import React from 'react';

export default function VerdictView({ scenario, accusation, narrative, narrativeLoading, onBack, onRestart }) {
  const accused = scenario?.suspects?.find((suspect) => suspect.id === accusation);
  const culprit = scenario?.suspects?.find((item) => item.id === scenario.coupable_id);
  const isCorrect = accusation === scenario?.coupable_id;

  return (
    <section className="screen verdict-screen">
      <div className="verdict-shell">
        <button className="verdict-back" onClick={onBack}>← Retour</button>

        <div className={`verdict-card ${isCorrect ? 'correct' : 'incorrect'}`}>
          <div className="verdict-header">
            <span className="case-stamp">VERDICT</span>
            <h2>{isCorrect ? 'Coupable confirmé' : 'Mauvaise piste'}</h2>
            <p>{isCorrect ? 'Tu as résolu l’affaire.' : 'La vérité est encore masquée.'}</p>
          </div>

          <div className="verdict-body">
            <p className={narrativeLoading ? 'narrative-loading' : 'narrative-ready'}>{narrative}</p>
            {narrativeLoading && <span className="narrative-spinner">Écriture du dénouement…</span>}

            <div className="verdict-grid">
              <div className="comparison-item">
                <p className="label">Accusé</p>
                <p className="name">{accused?.nom || 'Aucun suspect'}</p>
              </div>
              <div className="comparison-divider">—</div>
              <div className="comparison-item">
                <p className="label">Coupable réel</p>
                <p className="name">{culprit?.nom || 'Non trouvé'}</p>
              </div>
            </div>
          </div>

          <div className="verdict-actions">
            <button className="verdict-restart" onClick={onRestart}>Nouvelle enquête</button>
            <button className="verdict-review" onClick={onBack}>Revoir le dossier</button>
          </div>
        </div>
      </div>
    </section>
  );
}
