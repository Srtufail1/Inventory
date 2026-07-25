import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./index.css";
import "./responsive.css";
import { Toaster } from "@/components/ui/toaster";
import Providers from "@/lib/Providers";
import { ThemeProvider } from 'next-themes';
import { CustomersProvider } from '@/context/CustomersContext';
import { ItemsProvider } from '@/context/ItemsContext';
import { PackingsProvider } from '@/context/PackingsContext';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import PWARegistration from '@/components/PWARegistration';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "ZamZam Cold Storage",
    template: "%s | ZamZam Cold Storage",
  },
  description: "Inventory, billing, ledger, and cold-storage operations.",
  applicationName: "ZamZam Cold Storage",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ZamZam",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#146c66" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Providers>
            <CustomersProvider>
              <ItemsProvider>
                <PackingsProvider>
                  <Toaster />
                  <PWARegistration />
                  {children}
                </PackingsProvider>
              </ItemsProvider>
            </CustomersProvider>
          </Providers>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}