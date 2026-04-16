import type { Metadata } from "next";
import "./globals.css";
import ApolloProviderWrapper from "@/lib/ApolloProviderWrapper";

export const metadata: Metadata = {
  title: "BolKeOrder — Voice Commerce for Bharat",
  description:
    "बस बोलो, हम order करेंगे। Voice-first food ordering for every Indian — Hindi, Kannada, Tamil, Telugu, and more.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi">
      <head>
        {/* Preload local fonts */}
        <link
          rel="preload"
          href="/fonts/Rosehot.ttf"
          as="font"
          type="font/truetype"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Quivert.ttf"
          as="font"
          type="font/truetype"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-bko-bg text-bko-text antialiased">
        <ApolloProviderWrapper>
          {children}
        </ApolloProviderWrapper>
      </body>
    </html>
  );
}
