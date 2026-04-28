// src/components/Analytics.jsx
"use client";

import Script from 'next/script';
import { GA_MEASUREMENT_ID } from '@/utils/analytics';

/**
 * Analytics component loads Google Analytics script on the client side
 * and initializes gtag with the measurement ID. This avoids server‑side
 * errors caused by accessing `window` during server component rendering.
 */
export default function Analytics() {
  // If no measurement ID is provided, skip loading to avoid unnecessary requests.
  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      {/* Load the gtag script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
        async
      />
      {/* Initialize gtag */}
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
