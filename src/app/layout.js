import './globals.css';
import Analytics from '@/components/Analytics';
import Script from 'next/script';
import I18nProvider from '@/components/I18nProvider';
import ClientShell from '@/components/ClientShell';

export const metadata = {
  title: 'VoteNavigator — Your Interactive AI Voter Guide',
  description: 'Check voter eligibility, find polling booths, and explore party manifestos — powered by AI.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Google Analytics 4 (GA4) */}
        <Analytics />
        <I18nProvider>
          <ClientShell>
            {children}
          </ClientShell>
        </I18nProvider>
      </body>
    </html>
  );
}
