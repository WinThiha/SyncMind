import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider } from "@/context/ThemeContext";
import { ThemePreferenceSync } from "@/components/theme/ThemePreferenceSync";

export const metadata: Metadata = {
  title: "SyncMind",
  description: "Synchronize your mind with your tasks.",
};

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <AuthProvider>
              <ThemePreferenceSync />
              {children}
            </AuthProvider>
          </GoogleOAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
