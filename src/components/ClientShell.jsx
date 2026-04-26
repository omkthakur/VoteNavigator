'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Globe, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { trackEvent, trackPageView, GA_EVENTS } from '@/utils/analytics';

export default function ClientShell({ children }) {
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Track page views on every route change
  useEffect(() => {
    trackPageView(pathname, document.title);
  }, [pathname]);

  // Track language changes
  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    trackEvent(GA_EVENTS.LANGUAGE_CHANGE, { language: lang });
    i18n.changeLanguage(lang);
  };

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const pageVariants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  const navLinks = [
    { href: '/', label: t('nav_home'), id: 'nav-home' },
    { href: '/guide', label: t('nav_guide'), id: 'nav-guide' },
    { href: '/simulator', label: t('nav_simulator'), id: 'nav-simulator' },
    { href: '/tools', label: t('nav_tools'), id: 'nav-tools' },
    { href: '/manifestos', label: t('nav_manifestos', 'Party Manifestos'), id: 'nav-manifestos' },
  ];

  return (
    <div className="app-container">
      {/* Decorative blobs — hidden from screen readers */}
      <div className="blob blob-1" aria-hidden="true" />
      <div className="blob blob-2" aria-hidden="true" />
      <div className="blob blob-3" aria-hidden="true" />

      {/* ── Header ── */}
      <header className="header glass-panel" role="banner">
        <div className="header-content">
          <Link href="/" className="brand" aria-label="VoteNavigator — Home">
            <span className="brand-icon" aria-hidden="true">🗳️</span>
            <span className="brand-text">{t('app_title')}</span>
          </Link>

          <nav
            className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}
            role="navigation"
            aria-label="Main navigation"
            id="main-nav"
          >
            {navLinks.map(({ href, label, id }) => (
              <Link
                key={href}
                href={href}
                id={id}
                className={pathname === href ? 'active' : ''}
                onClick={() => setMobileMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            <div className="lang-selector">
              <Globe size={16} className="text-primary" aria-hidden="true" />
              <label htmlFor="lang-select" className="sr-only">
                {t('select_language', 'Select Language')}
              </label>
              <select
                id="lang-select"
                value={i18n.language}
                onChange={handleLanguageChange}
                className="lang-select"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="bn">বাংলা (Bengali)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="mr">मराठी (Marathi)</option>
                <option value="ta">தமிழ் (Tamil)</option>
              </select>
            </div>

            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="main-nav"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileMenuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="main-content" id="main-content" role="main">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ width: '100%' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── Footer ── */}
      <footer className="footer glass-panel" role="contentinfo">
        <p>
          &copy; {new Date().getFullYear()}{' '}
          <strong>VoteNavigator</strong>.{' '}
          {t('footer_tagline', 'Empowering voters through interactive learning.')}{' '}
          <a
            href="https://voterregistration.nic.in"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('register_to_vote', 'Register to Vote')}
          </a>
        </p>
      </footer>
    </div>
  );
}
