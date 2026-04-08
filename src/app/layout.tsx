import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Formations Professionnelles | World Wide Progress Academy",
  description:
    "Developpez vos competences avec nos formations professionnelles: Power BI, Digital Marketing, Automatisation & Fullstack, Ressources Humaines. Formateurs experts, 100% satisfaction garantie.",
  keywords: [
    "formation professionnelle",
    "Power BI",
    "Digital Marketing",
    "automatisation",
    "fullstack",
    "ressources humaines",
    "formation en ligne",
    "formation presentiel",
  ],
  authors: [{ name: "World Wide Progress Academy" }],
  openGraph: {
    title: "Formations Professionnelles | World Wide Progress Academy",
    description:
      "Developpez vos competences avec nos formations professionnelles",
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${bricolage.variable} ${dmSans.variable}`}>
      <body className="w-full min-h-screen bg-navy-900 text-text-primary font-body antialiased">
        {children}
      </body>
    </html>
  );
}
