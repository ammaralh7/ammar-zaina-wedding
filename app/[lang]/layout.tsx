import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Albert_Sans, Amiri, Aref_Ruqaa, DM_Serif_Display, Great_Vibes, Scheherazade_New } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { getDictionary } from "@/lib/dictionaries";
import { dirFor, isLocale, locales } from "@/lib/wedding-config";
import "../globals.css";

const albert = Albert_Sans({ variable: "--font-albert", subsets: ["latin"] });
const dmSerif = DM_Serif_Display({ variable: "--font-dm-serif", weight: "400", subsets: ["latin"] });
const greatVibes = Great_Vibes({ variable: "--font-great-vibes", weight: "400", subsets: ["latin"] });
const amiri = Amiri({ variable: "--font-amiri", weight: ["400", "700"], subsets: ["arabic"], preload: false });
const arefRuqaa = Aref_Ruqaa({ variable: "--font-aref-ruqaa", weight: ["400", "700"], subsets: ["arabic"], preload: false });
// Qur'an verses: made for fully vowelled text, so the harakat sit on their letters
const quran = Scheherazade_New({ variable: "--font-quran", weight: "400", subsets: ["arabic"], preload: false });

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.meta.title,
    description: dict.meta.description,
    openGraph: { title: dict.meta.title, description: dict.meta.description, type: "website" },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <html
      lang={lang}
      dir={dirFor(lang)}
      className={`${albert.variable} ${dmSerif.variable} ${greatVibes.variable} ${amiri.variable} ${arefRuqaa.variable} ${quran.variable} antialiased`}
    >
      <body className="min-h-svh overflow-x-clip">
        {children}
        <Toaster position="top-center" theme="light" richColors />
      </body>
    </html>
  );
}
