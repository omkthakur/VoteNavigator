'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Loader2, Navigation } from 'lucide-react';
import { fetchManifestosForLocation } from '@/utils/gemini';
import { trackEvent, GA_EVENTS } from '@/utils/analytics';
import useGeolocation from '@/hooks/useGeolocation';
import '../Tools.css';

export default function ManifestosPage() {
  const { t, i18n } = useTranslation();

  const { locationStr, loading: geoLoading, error: geoError, refetch } = useGeolocation();

  const [manifestos, setManifestos] = React.useState([]);
  const [manifestoLoading, setManifestoLoading] = React.useState(false);
  const [manifestoError, setManifestoError] = React.useState('');
  const [fetched, setFetched] = React.useState(false);

  React.useEffect(() => {
    if (locationStr && !fetched && !manifestoLoading) {
      fetchManifestos(locationStr);
    }
  }, [locationStr, fetched, manifestoLoading]);

  const fetchManifestos = async (loc) => {
    const locationToUse = loc || locationStr || 'India';
    setManifestoError('');
    setManifestoLoading(true);
    setManifestos([]);
    setFetched(true);

    try {
      trackEvent(GA_EVENTS.FETCH_MANIFESTOS, { location: locationToUse, language: i18n.language });
      const data = await fetchManifestosForLocation(locationToUse, i18n.language || 'en');
      setManifestos(data);
    } catch {
      setManifestoError(t('manifesto_error', 'Unable to fetch party manifestos. Please try again later.'));
    } finally {
      setManifestoLoading(false);
    }
  };

  const handleRefetch = () => {
    setFetched(false);
    refetch();
    if (locationStr) fetchManifestos(locationStr);
  };

  return (
    <div className="tools-container">
      <div className="tools-header">
        <h2>{t('nav_manifestos', 'Party Manifestos')}</h2>
        <p>{t('manifesto_desc')}</p>
      </div>

      <div className="tools-grid" style={{ display: 'flex', justifyContent: 'center' }}>
        <section className="tool-card glass-panel" style={{ width: '100%', maxWidth: '800px' }}>
          <div className="tool-card-header">
            <Sparkles className="text-primary" />
            <h3>{t('nav_manifestos', 'Party Manifestos')}</h3>
          </div>

          <div className="map-controls" style={{ marginTop: '1rem', alignItems: 'center' }}>
            {geoLoading && <p><Loader2 className="spin" size={14} /> {t('fetching_location')}</p>}
            {locationStr && !geoLoading && <p>📍 {t('location_detected')}: <strong>{locationStr}</strong></p>}
            {geoError && <p style={{ color: '#EF4444' }}>{geoError}</p>}

            <button className="btn btn-primary" onClick={handleRefetch} disabled={manifestoLoading || geoLoading} style={{ width: 'fit-content' }}>
              {manifestoLoading ? <Loader2 className="spin" size={18} /> : <Navigation size={18} />}
              {manifestoLoading ? t('analyzing_ai') : t('btn_fetch_manifestos')}
            </button>
            {manifestoError && <p style={{ color: '#EF4444' }}>{manifestoError}</p>}
          </div>

          {manifestoLoading && (
            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: '100px' }} />)}
            </div>
          )}

          {manifestos.length > 0 && (
            <div className="manifesto-list" style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {manifestos.map((party, index) => (
                <article key={index} className="manifesto-item" style={{ background: 'var(--bg-main)', padding: '1.5rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '2rem' }}>{party.symbol}</span>
                    <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.25rem' }}>{party.partyName}</h4>
                  </div>
                  <p style={{ margin: 0, fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{party.manifestoSummary}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
