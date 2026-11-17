import type { Metadata } from "next";
import { Archivo, Gabarito, Public_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import { SiteFooter } from "@/components/site-footer";

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var pref = localStorage.getItem("theme-preference") || "light";
    var dark = pref === "dark" || (pref === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (dark) document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
});

const gabarito = Gabarito({
  variable: "--font-gabarito",
  subsets: ["latin"],
  weight: "800",
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  // Variable font: every weight from 100 to 900 is available without listing them (a weight list made Vercel's build fail).
});

const SITE_DESCRIPTION =
  "Motive helps neighbors raise local issues, propose and vote on solutions, and follow public action plans until the problem is fixed.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://tachlis.vercel.app"),
  title: { default: "Motive: raise an issue, solve it together", template: "%s | Motive" },
  description: SITE_DESCRIPTION,
  applicationName: "Motive",
  keywords: ["community issues", "local problems", "petitions", "neighborhood", "action plan", "civic engagement"],
  openGraph: {
    type: "website",
    siteName: "Motive",
    title: "Motive: raise an issue, solve it together",
    description: SITE_DESCRIPTION,
    url: "/",
  },
  twitter: { card: "summary", title: "Motive: raise an issue, solve it together", description: SITE_DESCRIPTION },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${publicSans.variable} ${archivo.variable} ${gabarito.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
