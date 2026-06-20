import React, { useState } from 'react';

export default function DossierView({ scenario, selectedEvidence, onSelectEvidence, notes, onNotesChange, onBack }) {
  const [activeTab, setActiveTab] = useState('preuves');

  return (
    <section className="screen dossier-screen">
      <div className="dossier-shell">
        <div className="dossier-header">
          <button className="dossier-back" onClick={onBack}>← Retour</button>
          <div>
            <span className="file-label">Fichier</span>
            <h1>Dossier d'enquête</h1>
          </div>
          <div className="case-number">Affaire #{scenario.id || '001'}</div>
        </div>

        <div className="dossier-tabs">
          <button
            className={`dossier-tab ${activeTab === 'resume' ? 'active' : ''}`}
            onClick={() => setActiveTab('resume')}
          >
            RÉSUMÉ
          </button>
          <button
            className={`dossier-tab ${activeTab === 'preuves' ? 'active' : ''}`}
            onClick={() => setActiveTab('preuves')}
          >
            PREUVES
          </button>
          <button
            className={`dossier-tab ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            NOTES
          </button>
        </div>

        <div className="dossier-content">
          {activeTab === 'resume' && (
            <div className="resume-panel">
              <h2>{scenario.crime.victime}</h2>
              <p><strong>Lieu du crime :</strong> {scenario.crime.lieu}</p>
              <p><strong>Heure estimée :</strong> {scenario.crime.heure}</p>
              <p className="description">{scenario.crime.description}</p>
            </div>
          )}

          {activeTab === 'preuves' && (
            <div className="preuves-grid">
              {scenario.preuves.map((item) => (
                <button
                  key={item.id}
                  className={`evidence-frame ${selectedEvidence?.id === item.id ? 'active' : ''}`}
                  onClick={() => onSelectEvidence(item)}
                >
                  <div className="frame-magnifier">🔎</div>
                  <div className="frame-image">{item.emoji}</div>
                  <div className="frame-label">{item.titre}</div>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="notes-panel">
              <p className="notes-hint">Tes observations, pistes et contradictions repérées :</p>
              <textarea
                className="notes-textarea"
                placeholder="Ex: L'alibi de Martin ne colle pas avec la preuve n°3…"
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                rows={12}
              />
            </div>
          )}
        </div>

        {selectedEvidence && activeTab === 'preuves' && (
          <div className="evidence-details">
            <h3>{selectedEvidence.titre}</h3>
            <p><strong>Type :</strong> {selectedEvidence.type}</p>
            <p>{selectedEvidence.description}</p>
          </div>
        )}
      </div>
    </section>
  );
}
