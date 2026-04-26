'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import { trackEvent, GA_EVENTS } from '@/utils/analytics';
import '../Guide.css';

const steps = [
  { id: 1, titleKey: 'step_1', contentKey: 'step_1_desc', icon: '📝' },
  { id: 2, titleKey: 'step_2', contentKey: 'step_2_desc', icon: '🤝' },
  { id: 3, titleKey: 'step_3', contentKey: 'step_3_desc', icon: '📢' },
  { id: 4, titleKey: 'step_4', contentKey: 'step_4_desc', icon: '🗳️' },
  { id: 5, titleKey: 'step_5', contentKey: 'step_5_desc', icon: '🏆' },
];

export default function GuidePage() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);

  const goToStep = (index) => {
    setCurrentStep(index);
    trackEvent(GA_EVENTS.GUIDE_STEP_CHANGE, { step: index + 1 });
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) goToStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) goToStep(currentStep - 1);
  };

  return (
    <div className="guide-container">
      <div className="guide-header">
        <h2>{t('nav_guide')}</h2>
        <p>{t('guide_subtitle')}</p>

        <div className="country-selector">
          <label htmlFor="country">{t('select_country')}</label>
          <select id="country" className="select-input">
            <option value="in">{t('country_india')}</option>
          </select>
        </div>
      </div>

      <div
        role="progressbar"
        aria-valuenow={currentStep + 1}
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-label={`Step ${currentStep + 1} of ${steps.length}: ${t(steps[currentStep].titleKey)}`}
        className="sr-only"
      />

      <div className="stepper-wrapper">
        <nav
          className="stepper-nav"
          aria-label={t('guide_progress', 'Guide progress')}
        >
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`stepper-item ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
              onClick={() => goToStep(index)}
              role="button"
              tabIndex={0}
              aria-label={`${t(step.titleKey)}${index < currentStep ? ' — completed' : ''}`}
              aria-current={index === currentStep ? 'step' : undefined}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  goToStep(index);
                }
              }}
            >
              <div className="step-circle" aria-hidden="true">
                {index < currentStep ? <CheckCircle size={20} /> : step.id}
              </div>
              <span className="step-title">{t(step.titleKey)}</span>
              {index < steps.length - 1 && <div className="step-line" aria-hidden="true" />}
            </div>
          ))}
        </nav>

        <div
          className="step-content-card glass-panel"
          aria-live="polite"
          aria-atomic="true"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="step-content-inner"
            >
              <div className="step-icon-large" aria-hidden="true">
                {steps[currentStep].icon}
              </div>
              <h3>{t(steps[currentStep].titleKey)}</h3>
              <p>{t(steps[currentStep].contentKey)}</p>
            </motion.div>
          </AnimatePresence>

          <div className="step-actions">
            <button
              className="btn btn-secondary"
              onClick={prevStep}
              disabled={currentStep === 0}
              aria-label={t('btn_prev', 'Previous step')}
              aria-disabled={currentStep === 0}
              id="guide-prev-btn"
            >
              <ChevronLeft size={18} aria-hidden="true" /> {t('btn_prev')}
            </button>
            <button
              className="btn btn-primary"
              onClick={nextStep}
              disabled={currentStep === steps.length - 1}
              aria-label={t('btn_next', 'Next step')}
              aria-disabled={currentStep === steps.length - 1}
              id="guide-next-btn"
            >
              {t('btn_next')} <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
