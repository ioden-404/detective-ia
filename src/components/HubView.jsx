import React from 'react';

export default function HubView({ scenario, onOpenDossier, onOpenInterrogatoire, onOpenVerdict }) {
  return (
    <section className="screen hub-screen">
      <div className="crime-board">
        <div className="board-header">
          <span className="board-tag">DOSSIER CRIMINEL</span>
          <h1 className="board-title">Affaire : {scenario.crime.lieu}</h1>
          <p className="board-subtitle">{scenario.crime.description}</p>
        </div>

        <div className="board-area">
          <div className="polaroid polaroid-victim">
            <div className="polaroid-frame">
              <span>VICTIME</span>
            </div>
            <div className="polaroid-caption">{scenario.crime.victime}</div>
          </div>

          <div className="paper-note note-mobile">
            <strong>MOBILE</strong>
            <p>{scenario.crime.mobile || 'À découvrir'}</p>
          </div>

          <div className="polaroid polaroid-suspects">
            <div className="polaroid-frame">
              <span>SUSPECTS</span>
            </div>
            <div className="polaroid-caption">{scenario.suspects.length} personnes</div>
          </div>

          <div className="paper-note note-alibi">
            <strong>ALIBIS</strong>
            <p>Vérifie les contradictions.</p>
          </div>

          <div className="polaroid polaroid-weapon">
            <div className="polaroid-frame">
              <span>ARME</span>
            </div>
            <div className="polaroid-caption">
              {scenario.preuves.find((item) => item.type === 'arme')?.titre || 'Indéterminée'}
            </div>
          </div>

          <div className="paper-note note-location">
            <strong>LIEU</strong>
            <p>{scenario.crime.lieu}</p>
          </div>
        </div>

        <svg className="red-string" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M 16 18 C 32 10, 50 10, 82 22" />
          <path d="M 18 80 C 24 66, 38 56, 54 46" />
          <path d="M 50 46 C 64 40, 76 38, 82 22" />
          <path d="M 32 58 C 46 52, 56 58, 72 70" />
        </svg>

        <div className="board-cta">
          <button className="board-button" onClick={onOpenDossier}>Ouvrir le dossier</button>
          <button className="board-button secondary" onClick={onOpenInterrogatoire}>Interroger</button>
          <button className="board-button secondary" onClick={onOpenVerdict}>Verdict</button>
        </div>
      </div>
    </section>
  );
}
