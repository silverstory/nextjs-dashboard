import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import { Metadata } from 'next';

// export const metadata: Metadata = {
//   title: 'Menu + Recipe',
//   description: 'The official Menu + Recipe Dashboard, 2k24.',
//   metadataBase: new URL('https://menu.op-proper.gov.ph'),
// };

export const metadata: Metadata = {
  title: {
    template: '%s | Menu + Recipe',
    default: 'Menu + Recipe',
  },
  description: 'The official Menu + Recipe Dashboard 2k24.',
  metadataBase: new URL('https://menu.op-proper.gov.ph'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}