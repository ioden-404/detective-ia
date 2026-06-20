import React, { useState } from 'react';

export default function InterrogatoireView({ scenario, suspects, evidences, selectedSuspect, chatHistory, alibiRevealed, isReplying, onSelectSuspect, onSendMessage, onAccuse, onBack }) {
  const [message, setMessage] = useState('');
  const [selectedEvidence, setSelectedEvidence] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    onSendMessage(message.trim(), selectedEvidence);
    setMessage('');
    setSelectedEvidence(null);
  };

  const handleQuickQuestion = (text) => {
    onSendMessage(text, selectedEvidence);
    setSelectedEvidence(null);
  };

  return (
    <section className="screen interrogation-screen">
      <div className="interrogation-shell">
        <button className="interrogation-close" onClick={onBack}>&#x2715;</button>

        <div className="interrogation-board">
          <aside className="suspect-board">
            <div className="suspect-pin"></div>
            <div className="suspect-sheet">
              <div className="suspect-portrait">&#x1F464;</div>
              <h2>{selectedSuspect ? selectedSuspect.nom : 'Choisis un suspect'}</h2>
              <p className="suspect-role">{selectedSuspect?.profession || 'Témoin indéterminé'}</p>
            </div>

            {selectedSuspect && (
              <div className="suspect-profile">
                <div className="profile-row">
                  <span className="profile-label">Mobile</span>
                  <span className="profile-value">{selectedSuspect.mobile || '—'}</span>
                </div>
                <div className="profile-row profile-row-alibi">
                  <span className="profile-label">Alibi</span>
                  {alibiRevealed[selectedSuspect.id] ? (
                    <span className="profile-value">{selectedSuspect.alibi}</span>
                  ) : (
                    <span className="profile-value alibi-unknown">Interroge ce suspect pour en savoir plus…</span>
                  )}
                </div>
              </div>
            )}

            <div className="suspect-choices">
              {suspects.map((suspect) => (
                <button
                  key={suspect.id}
                  className={`suspect-option ${selectedSuspect?.id === suspect.id ? 'selected' : ''}`}
                  onClick={() => onSelectSuspect(suspect)}
                >
                  {suspect.nom}
                </button>
              ))}
            </div>
          </aside>

          <main className="interrogation-main">
            {selectedSuspect ? (
              <>
                <div className="chat-log">
                  {(chatHistory.length ? chatHistory : [{ role: 'system', text: 'Écris une première question ou utilise les pistes.' }]).map((messageItem, index) => (
                    <div key={index} className={`chat-bubble ${messageItem.role}`}>
                      <span>{messageItem.text}</span>
                    </div>
                  ))}
                </div>

                <div className="evidence-picker">
                  <span className="evidence-picker-label">Confronter avec une preuve :</span>
                  <div className="evidence-chips">
                    {evidences.map((ev) => (
                      <button
                        key={ev.id}
                        className={`evidence-chip ${selectedEvidence?.id === ev.id ? 'active' : ''}`}
                        onClick={() => setSelectedEvidence(selectedEvidence?.id === ev.id ? null : ev)}
                        title={ev.description}
                      >
                        {ev.emoji} {ev.titre}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="interrogation-actions">
                  <button className="question-btn" type="button" onClick={() => handleQuickQuestion('Où étiez-vous cette nuit-là ?')}>Où étiez-vous cette nuit ?</button>
                  <button className="question-btn" type="button" onClick={() => handleQuickQuestion('Que faisiez-vous à 23h ?')}>Que faisiez-vous à 23h ?</button>
                  <button className="question-btn" type="button" onClick={() => handleQuickQuestion('Connaissiez-vous la victime ?')}>Connaissiez-vous la victime ?</button>
                  <button className="question-btn accuse-btn" type="button" onClick={() => onAccuse(selectedSuspect.id)}>Accuser ce suspect</button>
                </div>

                <form className="interrogation-input" onSubmit={handleSubmit}>
                  <input
                    type="text"
                    placeholder={selectedEvidence ? `Question + preuve "${selectedEvidence.titre}"…` : 'Pose ta question au suspect...'}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isReplying}
                  />
                  <button className="send-button" type="submit" disabled={isReplying}>Envoyer</button>
                </form>

                {isReplying && <div className="interrogation-loading">Réponse en cours…</div>}
              </>
            ) : (
              <div className="interrogation-select">
                <p>Sélectionne un suspect pour l'interroger.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </section>
  );
}
