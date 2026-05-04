import type { Metadata } from "next";
import "./globals.css";
import ValorantChatbot from "./ValorantChatbot";

export const metadata: Metadata = {
  title: "InstaloLock — AI-Powered Valorant Agent Selector",
  description:
    "Analyze your real Valorant stats and get personalized agent recommendations, optimal team compositions, and map-specific meta insights powered by AI.",
  keywords: ["Valorant", "Agent Picker", "Team Comp", "AI", "InstaloLock", "Riot Games"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect for faster font + image loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://media.valorant-api.com" />
      </head>
      <body>
        <div className="page-wrapper">{children}</div>
        <ValorantChatbot />
      </body>
    </html>
  );
}
