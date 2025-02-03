import type { Metadata } from "next";
import { Geist, Geist_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'], // Customize subsets as needed
  weight: ['400', '500', '600', '700'], // Add desired font weights
  variable: '--font-ibm-plex', // Set a CSS variable
});

export const metadata: Metadata = {
  title: "SupraDrive",
  description: "Secure cloud storage for your files",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ibmPlexSans.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
