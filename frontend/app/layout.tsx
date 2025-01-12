import '#/styles/globals.css';
import { AddressBar } from '#/ui/address-bar';
import Byline from '#/ui/byline';
import { GlobalNav } from '#/ui/global-nav';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'SupraDrive',
    template: '%s | SupraDrive',
  },
  metadataBase: new URL('https://drive.suprageir.no'),
  description:
    'SupraDrive is a platform for secure and encrypted file storage and sharing.',
  openGraph: {
    title: 'SupraDrive',
    description:
      'SupraDrive is a platform for secure and encrypted file storage and sharing.',
    images: [`/api/og?title=SupraDrive`],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="[color-scheme:dark]">
      <body className="overflow-y-scroll bg-gray-1100 bg-[url('/grid.svg')] pb-36">
        {children}
      </body>
    </html>
  );
}
