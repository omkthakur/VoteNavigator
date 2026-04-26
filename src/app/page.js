'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ExternalLink } from 'lucide-react';

export default function HomePage() {
  const { t } = useTranslation();
  
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>{t('hero_title')}</h1>
        <p>{t('hero_subtitle')}</p>
        <div className="hero-buttons">
          <Link href="/guide" className="btn btn-primary" id="start-journey-btn">
            {t('start_journey')}
          </Link>
          <Link href="/tools" className="btn btn-secondary" id="check-eligibility-btn">
            {t('check_eligibility')}
          </Link>
        </div>

        {/* Voter Registration CTA */}
        <div className="voter-reg-cta" style={{ marginTop: '2rem' }}>
          <a
            href="https://voterregistration.nic.in"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
            id="voter-registration-link"
            aria-label="Register to vote on the National Voter Service Portal (opens in new tab)"
          >
            <ExternalLink size={16} aria-hidden="true" />
            {t('register_to_vote', 'Register to Vote')}
          </a>
        </div>
      </div>
    </div>
  );
}
