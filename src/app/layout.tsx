import type { Metadata, Viewport } from "next";
import { Baloo_2 } from "next/font/google";
import "./globals.css";
import { PwaRegister } from "@/components/pwa/PwaRegister";

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Little Tracers",
  description:
    "A free, magical handwriting adventure for children ages 3–6. Trace letters, numbers, and shapes across five joyful worlds.",
  applicationName: "Little Tracers",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Little Tracers",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#7dd3fc",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${baloo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col touch-manipulation">
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
