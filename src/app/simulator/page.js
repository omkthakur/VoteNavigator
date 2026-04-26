'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Info, Loader2 } from 'lucide-react';
import { getManifestosAction } from '@/app/actions';
import { trackEvent, GA_EVENTS } from '@/utils/analytics';
import useGeolocation from '@/hooks/useGeolocation';
import '../Simulator.css';

const defaultCandidates = [
  { id: 1, name: 'Candidate A', party: 'Progressive Party', symbol: '🌟' },
  { id: 2, name: 'Candidate B', party: 'Unity Front', symbol: '🤝' },
  { id: 3, name: 'Candidate C', party: 'Liberty Coalition', symbol: '🕊️' },
  { id: 4, name: 'NOTA', party: 'None of the Above', symbol: '❌' },
];

export default function SimulatorPage() {
  const { t, i18n } = useTranslation();
  const [phase, setPhase] = useState('choose'); // choose | confirm | result
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidates, setCandidates] = useState(defaultCandidates);
  const [loadingParties, setLoadingParties] = useState(true);
  const [randomQuote, setRandomQuote] = useState('');

  const { locationStr } = useGeolocation();

  useEffect(() => {
    if (!locationStr) return;

    let cancelled = false;
    const fetchParties = async () => {
      try {
        const data = await getManifestosAction(locationStr, i18n.language || 'en');
        if (cancelled) return;
        if (data && data.length > 0) {
          const dynamicCandidates = data.map((p, index) => ({
            id: index + 1,
            name: `Candidate ${String.fromCharCode(65 + index)}`,
            party: p.partyName,
            symbol: p.symbol,
          }));
          dynamicCandidates.push({
            id: 99,
            name: t('nota', 'NOTA'),
            party: t('none_of_above', 'None of the Above'),
            symbol: '❌',
          });
          setCandidates(dynamicCandidates);
        }
      } catch (err) {
        console.error('Failed to load local parties', err);
      } finally {
        if (!cancelled) setLoadingParties(false);
      }
    };

    fetchParties();
    return () => { cancelled = true; };
  }, [locationStr, i18n.language, t]);

  const handleVote = () => {
    if (selectedCandidate) setPhase('confirm');
  };

  const confirmVote = () => {
    const quoteKeys = ['vote_quote_1', 'vote_quote_2', 'vote_quote_3', 'vote_quote_4', 'vote_quote_5'];
    setRandomQuote(t(quoteKeys[Math.floor(Math.random() * quoteKeys.length)]));
    trackEvent(GA_EVENTS.CAST_VOTE, { candidate_party: selectedCandidate?.party });
    setPhase('result');
  };

  const resetSimulator = () => {
    setPhase('choose');
    setSelectedCandidate(null);
  };

  return (
    <div className="simulator-container">
      <div className="simulator-header">
        <h2>{t('nav_simulator', 'EVM Simulator')}</h2>
        <p>{t('sim_subtitle', 'Experience how voting works using real local parties.')}</p>
      </div>

      <div className="simulator-card glass-panel">
        <AnimatePresence mode="wait">
          {phase === 'choose' && (
            <motion.div
              key="choose"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="phase-container"
            >
              <h3>{t('evm_title', 'Electronic Voting Machine')}</h3>

              {loadingParties ? (
                <div role="status" aria-live="polite" style={{ padding: '2rem', textAlign: 'center' }}>
                  <Loader2 className="spin" size={32} style={{ margin: '0 auto 1rem', display: 'block', color: 'var(--primary-color)' }} />
                  <p>{t('loading_parties', 'Loading real political parties for your location...')}</p>
                </div>
              ) : (
                <>
                  <p className="instruction">
                    <Info size={16} aria-hidden="true" />
                    {t('evm_instruct', 'Select your preferred candidate and click Vote.')}
                  </p>

                  <div className="evm-machine" role="radiogroup">
                    {candidates.map((candidate) => {
                      const isSelected = selectedCandidate?.id === candidate.id;
                      return (
                        <div
                          key={candidate.id}
                          className={`evm-row ${isSelected ? 'selected' : ''}`}
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => setSelectedCandidate(candidate)}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setSelectedCandidate(candidate);
                            }
                          }}
                        >
                          <div className="evm-candidate-info">
                            <span className="candidate-symbol" aria-hidden="true">{candidate.symbol}</span>
                            <div className="candidate-details">
                              <span className="candidate-name">{candidate.name}</span>
                              <span className="candidate-party">{candidate.party}</span>
                            </div>
                          </div>
                          <button className={`evm-button ${isSelected ? 'active' : ''}`} tabIndex={-1} />
                        </div>
                      );
                    })}
                  </div>

                  <div className="simulator-actions">
                    <button className="btn btn-primary btn-large" onClick={handleVote} disabled={!selectedCandidate}>
                      {t('cast_vote', 'Cast Vote')}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {phase === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="phase-container text-center"
            >
              <h3>{t('confirm_title', 'Confirm Your Vote')}</h3>
              <div className="confirmation-box">
                <span className="large-symbol">{selectedCandidate.symbol}</span>
                <h4>{t('about_to_vote', 'You are about to vote for')}</h4>
                <p className="highlight-text">{selectedCandidate.name}</p>
                <p>({selectedCandidate.party})</p>
              </div>
              <div className="simulator-actions flex-center">
                <button className="btn btn-secondary" onClick={() => setPhase('choose')}>{t('btn_cancel')}</button>
                <button className="btn btn-primary" onClick={confirmVote}>{t('btn_confirm')}</button>
              </div>
            </motion.div>
          )}

          {phase === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="phase-container text-center"
              style={{ padding: '3rem 1rem' }}
            >
              <div className="success-check"><Check size={44} color="white" /></div>
              <h2 style={{ color: '#10B981', marginBottom: '1rem', fontSize: '1.9rem' }}>{t('vote_success')}</h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto' }}>{t('vote_confidential_msg')}</p>
              <div className="vote-quote-card"><p>"{randomQuote}"</p></div>
              <button className="btn btn-secondary" style={{ marginTop: '3rem' }} onClick={resetSimulator}>{t('restart_sim')}</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
