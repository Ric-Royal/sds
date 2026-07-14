import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://datasds.org"),
  title: {
    default: "SDS — Decision Intelligence & Applied Systems",
    template: "%s | SDS",
  },
  description:
    "SDS is a decision intelligence and applied systems company focused on analytics, applied AI, research, and sector-specific digital systems.",
  applicationName: "SDS",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "SDS",
    title: "SDS — Decision Intelligence & Applied Systems",
    description:
      "Decision intelligence, applied AI, research, and digital systems built for complex environments.",
    url: "/",
    images: [
      {
        url: new URL("/og.png", "https://datasds.org"),
        width: 1730,
        height: 909,
        alt: "SDS — Data. Decisions. Systems.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SDS — Decision Intelligence & Applied Systems",
    description:
      "Decision intelligence, applied AI, research, and digital systems built for complex environments.",
    images: [new URL("/og.png", "https://datasds.org")],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col overflow-x-hidden font-sans">
        <Navigation />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
