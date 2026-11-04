import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { AppProviders } from "./providers";
import { AuthBootstrap } from "../components/auth-bootstrap";
import { AnalyticsTracker } from "../components/analytics-tracker";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.PUBLIC_BASE_URL || "http://localhost:3000"),
  title: "WOFEM | World of Faith Evangelistic Ministries International",
  description:
    "Join World of Faith Evangelistic Ministries International in Runda and Githogoro, Nairobi. Raising winners in life.",
  icons: { icon: "/assets/wofem-logo.png" },
  openGraph: {
    title: "WOFEM | World of Faith Evangelistic Ministries International",
    description:
      "A welcoming church community in Runda and Githogoro, Nairobi.",
    images: ["/assets/wofem-logo.png"],
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await headers();

  return (
    <html lang="en">
      <body>
        <AppProviders>
          <AuthBootstrap />
          <AnalyticsTracker />
          <SiteHeader />
          {children}
          <SiteFooter />
        </AppProviders>
      </body>
    </html>
  );
}
