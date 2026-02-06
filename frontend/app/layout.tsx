import "./polyfills"; // MUST BE FIRST
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import SchemaData from "./components/SchemaData";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | ORC",
    default: "ORC | Your Supply Chain. Orchestrated.",
  },
  description: "Decouple the complexity of global trade from human effort. The first glass-box AI for supply chain intake and compliance.",
  icons: {
    icon: "/orc.png",
    shortcut: "/orc.svg",
    apple: "/orc.png",
  },
  openGraph: {
    title: "ORC | Your Supply Chain. Orchestrated.",
    description: "Decouple the complexity of global trade from human effort.",
    siteName: "ORC",
    images: [{ url: "/orc.png" }],
    type: "website",
  },
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <SchemaData />
        {children}
      </body>
    </html>
  );
}
