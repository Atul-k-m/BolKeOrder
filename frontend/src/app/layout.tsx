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
        {/* Local fonts */}
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
        {/* Google Fonts — Yatra One (Hindi display) + Playfair Display + Inter */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Yatra+One&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ApolloProviderWrapper>
          {children}
        </ApolloProviderWrapper>
      </body>
    </html>
  );
}
