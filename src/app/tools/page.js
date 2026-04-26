'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, MapPin, Calendar, CheckCircle2, XCircle, BarChart3, Navigation, Loader2, AlertCircle } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { fetchSIRDetails } from '@/utils/gemini';
import { checkEligibility } from '@/utils/eligibility';
import { trackEvent, GA_EVENTS } from '@/utils/analytics';
import useGeolocation from '@/hooks/useGeolocation';
import '../Tools.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const stateTurnoutData = {
  "Tamil Nadu": { rank: 15, data: [60.81, 73.02, 73.67, 72.44, 69.72] },
  "Maharashtra": { rank: 22, data: [54.38, 50.71, 60.32, 61.02, 61.33] },
  "Uttar Pradesh": { rank: 26, data: [48.16, 47.79, 58.35, 59.21, 56.92] },
  "West Bengal": { rank: 3, data: [78.04, 81.42, 82.22, 81.76, 80.56] },
  "Kerala": { rank: 10, data: [71.45, 73.37, 73.94, 77.67, 71.27] },
  "Assam": { rank: 1, data: [69.11, 69.60, 80.12, 81.52, 81.56] },
  "Karnataka": { rank: 14, data: [65.14, 58.81, 67.20, 68.81, 70.64] },
  "Delhi": { rank: 23, data: [47.09, 51.85, 65.10, 60.60, 58.69] },
  "Default": { rank: '-', data: [60.0, 61.0, 63.0, 64.0, 62.0] },
};

const ELECTION_YEARS = ['2004', '2009', '2014', '2019', '2024'];

export default function ToolsPage() {
  const { t, i18n } = useTranslation();

  const { location, locationStr, loading: geoLoading, error: geoError, refetch } = useGeolocation();

  const [age, setAge] = useState('');
  const [citizenship, setCitizenship] = useState('yes');
  const [eligibilityResult, setEligibilityResult] = useState(null);

  const [residenceType, setResidenceType] = useState('permanent');

  const [sirData, setSirData] = useState(null);
  const [sirLoading, setSirLoading] = useState(false);
  const [sirError, setSirError] = useState('');
  const [sirFetched, setSirFetched] = useState(false);

  const chartState = location?.state && stateTurnoutData[location.state]
    ? location.state
    : 'Default';

  React.useEffect(() => {
    if (locationStr && !sirFetched && !sirLoading) {
      handleFetchSIR(locationStr);
    }
  }, [locationStr, sirFetched, sirLoading]);

  const handleFetchSIR = async (loc) => {
    const locationToUse = loc || locationStr || 'India';
    setSirError('');
    setSirLoading(true);
    setSirData(null);
    setSirFetched(true);
    try {
      const data = await fetchSIRDetails(locationToUse, i18n.language || 'en');
      setSirData(data);
    } catch {
      setSirError(t('sir_error', 'Unable to fetch SIR data. Please try again later.'));
    } finally {
      setSirLoading(false);
    }
  };

  const handleCheckEligibility = (e) => {
    e.preventDefault();
    const result = checkEligibility({ age, citizenship, t });
    setEligibilityResult(result);
    if (result) {
      trackEvent(GA_EVENTS.ELIGIBILITY_RESULT, { eligible: result.eligible });
    }
  };

  const chartData = useMemo(() => {
    const currentStateData = stateTurnoutData[chartState] || stateTurnoutData.Default;

    const nationalDataset = {
      label: t('national_avg', 'National Average (%)'),
      data: [58.07, 58.21, 66.44, 67.40, 66.10],
      backgroundColor: chartState === 'Default' ? '#22C55E' : 'rgba(156,163,175,0.65)',
      borderRadius: 4,
    };

    const datasets = [nationalDataset];
    if (chartState !== 'Default') {
      datasets.push({
        label: t('state_turnout', '{{state}} Turnout (%)', { state: chartState }),
        data: currentStateData.data,
        backgroundColor: '#22C55E',
        borderRadius: 4,
      });
    }

    return { datasets, currentStateData };
  }, [chartState, t]);

  const mapEmbedUrl = location
    ? `https://maps.google.com/maps?q=${location.lat},${location.lng}&z=15&output=embed`
    : `https://maps.google.com/maps?q=28.6139,77.2090&z=13&output=embed`;

  return (
    <div className="tools-container">
      <div className="tools-header">
        <h2>{t('nav_tools')}</h2>
        <p>{t('tools_subtitle')}</p>
      </div>

      <div className="tools-grid">
        <section className="tool-card glass-panel">
          <div className="tool-card-header">
            <Calendar className="text-primary" />
            <h3>{t('eligibility_title')}</h3>
          </div>
          <form className="tool-form" onSubmit={handleCheckEligibility}>
            <div className="form-group">
              <label>{t('how_old')}</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder={t('enter_age')}
                required
                className="form-input"
              />
            </div>
            <fieldset className="form-group">
              <legend>{t('are_you_citizen')}</legend>
              <div className="radio-group">
                <label className="radio-label">
                  <input type="radio" value="yes" checked={citizenship === 'yes'} onChange={() => setCitizenship('yes')} />
                  {t('yes')}
                </label>
                <label className="radio-label">
                  <input type="radio" value="no" checked={citizenship === 'no'} onChange={() => setCitizenship('no')} />
                  {t('no')}
                </label>
              </div>
            </fieldset>
            <button type="submit" className="btn btn-primary">{t('btn_check_eligibility')}</button>
          </form>
          {eligibilityResult && (
            <div className={`result-box ${eligibilityResult.eligible ? 'success' : 'error'}`}>
              {eligibilityResult.eligible ? <CheckCircle2 /> : <XCircle />}
              <p>{eligibilityResult.message}</p>
            </div>
          )}
        </section>

        <section className="tool-card glass-panel">
          <div className="tool-card-header">
            <FileText className="text-primary" />
            <h3>{t('checklist_title')}</h3>
          </div>
          <p className="tool-desc">{t('checklist_desc')}</p>
          <div className="form-group">
            <label>{t('res_permanent', 'Residence Type')}</label>
            <select className="form-input select-styled" value={residenceType} onChange={(e) => setResidenceType(e.target.value)}>
              <option value="permanent">{t('res_permanent')}</option>
              <option value="student">{t('res_student')}</option>
              <option value="tenant">{t('res_tenant')}</option>
            </select>
          </div>
          <div className="checklist">
            <h4>{t('doc_mandatory')}</h4>
            <ul>
              <li><CheckCircle2 size={16} /> {t('doc_photo')}</li>
              <li><CheckCircle2 size={16} /> {t('doc_age')}</li>
            </ul>
            <h4>{t('doc_address')}</h4>
            <ul>
              {residenceType === 'permanent' && <li><MapPin size={16} /> {t('doc_aadhaar')}</li>}
              {residenceType === 'student' && <li><MapPin size={16} /> {t('doc_warden')}</li>}
              {residenceType === 'tenant' && <li><MapPin size={16} /> {t('doc_rent')}</li>}
            </ul>
          </div>
        </section>

        <section className="tool-card glass-panel">
          <div className="tool-card-header">
            <AlertCircle className="text-primary" />
            <h3>{t('sir_title', 'Special Intensive Revision (SSR/SIR)')}</h3>
          </div>
          <p className="tool-desc">{t('sir_desc')}</p>
          <div className="map-controls" style={{ marginTop: '1rem' }}>
            {geoLoading && <p><Loader2 className="spin" size={14} /> {t('fetching_location')}</p>}
            {locationStr && !geoLoading && <p>📍 {t('location_detected')}: <strong>{locationStr}</strong></p>}
            <button className="btn btn-primary" onClick={() => handleFetchSIR()} disabled={sirLoading || geoLoading}>
              {sirLoading ? <Loader2 className="spin" size={18} /> : <AlertCircle size={18} />}
              {sirLoading ? t('analyzing_ai') : t('btn_fetch_sir')}
            </button>
            {sirError && <p style={{ color: '#EF4444' }}>{sirError}</p>}
          </div>
          {sirData && (
            <div className="sir-content" style={{ marginTop: '1.5rem', background: 'var(--bg-main)', padding: '1.5rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--glass-border)' }}>
              <h4>{sirData.title}</h4>
              <p>{sirData.overview}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <h5>{t('things_to_know')}</h5>
                  <ul className="checklist">
                    {sirData.thingsToKnow?.map((item, i) => <li key={i}><CheckCircle2 size={16} /> {item}</li>)}
                  </ul>
                </div>
                <div>
                  <h5>{t('sir_docs')}</h5>
                  <ul className="checklist">
                    {sirData.documentsNeeded?.map((doc, i) => <li key={i}><FileText size={16} /> {doc}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="tool-card glass-panel" style={{ gridColumn: '1 / -1' }}>
          <div className="tool-card-header">
            <MapPin className="text-primary" />
            <h3>{t('map_title')}</h3>
          </div>
          <p className="tool-desc">{t('map_desc')}</p>
          <div className="map-controls">
            <button className="btn btn-primary" onClick={() => { refetch(); trackEvent(GA_EVENTS.FIND_BOOTH); }} disabled={geoLoading}>
              {geoLoading ? <Loader2 className="spin" size={18} /> : <Navigation size={18} />}
              {geoLoading ? t('locating') : t('find_near_me')}
            </button>
          </div>
          <div className="map-container" style={{ height: '380px', borderRadius: 'var(--border-radius-md)', overflow: 'hidden', marginTop: '1rem', border: '1px solid var(--glass-border)' }}>
            <iframe title={t('map_title')} src={mapEmbedUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" />
          </div>
        </section>

        <section className="tool-card glass-panel" style={{ gridColumn: '1 / -1' }}>
          <div className="tool-card-header">
            <BarChart3 className="text-primary" />
            <h3>{t('chart_title')}</h3>
          </div>
          <p className="tool-desc">{t('chart_desc')}</p>
          {chartData.currentStateData && (
            <div className="rank-badge">
              <span>🏆</span>
              <p><strong>{chartState}</strong> {chartData.currentStateData.rank !== '-' ? t('chart_state_rank', { rank: chartData.currentStateData.rank }) : t('chart_state_rank_na')}</p>
            </div>
          )}
          <div className="chart-container" style={{ height: '350px', marginTop: '1.5rem' }}>
            <Bar
              data={{ labels: ELECTION_YEARS, datasets: chartData.datasets }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' }, title: { display: true, text: chartState !== 'Default' ? t('state_vs_national', { state: chartState }) : t('national_trend') } } }}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
