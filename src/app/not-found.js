'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div
      role="main"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <span style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>🗳️</span>
      <h1 style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--primary-color)', margin: 0 }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginTop: '0.5rem' }}>
        {t('not_found_title', 'Page Not Found')}
      </h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', marginTop: '1rem', lineHeight: 1.6 }}>
        {t('not_found_desc', "The page you're looking for doesn't exist. Let's get you back on track.")}
      </p>
      <Link href="/" className="btn btn-primary" style={{ marginTop: '2rem' }}>
        {t('go_home', 'Go to Home')}
      </Link>
    </div>
  );
}
