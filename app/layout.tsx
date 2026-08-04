import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NAS Remote',
  description: 'Remote dashboard for home NAS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
