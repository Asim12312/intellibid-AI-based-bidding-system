import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata = {
  title: "IntelliBid | AI-Powered Auctions",
  description: "Bid smarter, win louder. The next-gen auction platform powered by AI.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} h-full`}>
      <body className="min-h-full antialiased selection:bg-[var(--hotpink)] selection:text-white">
        {children}
      </body>
    </html>
  );
}
