import type { Metadata } from "next";
import { Syne, DM_Sans, JetBrains_Mono, Poppins } from "next/font/google";
import "./globals.css";

const syne = Syne({ 
  subsets: ["latin"], 
  weight: ["400", "600", "700", "800"],
  variable: "--font-syne" 
});
const dmSans = DM_Sans({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600"],
  variable: "--font-dm-sans" 
});
const jbMono = JetBrains_Mono({ 
  subsets: ["latin"], 
  weight: ["400", "500"],
  variable: "--font-jb-mono" 
});
const poppins = Poppins({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins" 
});

export const metadata: Metadata = {
  title: "BolKeOrder — Voice Commerce AI Platform",
  description: "Vernacular voice-first food ordering for every Indian. Just say it, we'll handle the rest.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${syne.variable} ${dmSans.variable} ${jbMono.variable} ${poppins.variable} font-sans bg-bko-bg text-bko-text antialiased`}>
        {children}
      </body>
    </html>
  );
}
