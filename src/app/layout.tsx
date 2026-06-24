import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter, Cinzel, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Githmie & Ruwan's Wedding Invitation",
  description: "Together with our families, we warmly invite you to celebrate our wedding and share in our happiness on September 20, 2026.",
  authors: [{ name: "Githmie & Ruwan" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${cinzel.variable} ${cormorant.variable} scroll-smooth h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0B0B0B] text-white">
        {children}
      </body>
    </html>
  );
}
