import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { SiteChrome } from "@/components/features/navigation/SiteChrome";
import {
  getCurrentUser,
  getDashboardPathForRole,
} from "@/lib/api/session-server";
import type { NavUser } from "@/components/features/navigation/nav-data";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Crestem ONG",
  description:
    "Crestem este platforma care reunește resurse, instrumente juridice, programe de accelerare și o comunitate vibrantă pentru toți cei care construiesc schimbarea în România.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  let navUser: NavUser | null = null;
  try {
    const currentUser = await getCurrentUser();
    const dashboardHref = currentUser
      ? getDashboardPathForRole(currentUser.role?.type)
      : null;
    if (currentUser && dashboardHref) {
      navUser = { nume: currentUser.nume, dashboardHref };
    }
  } catch {
    navUser = null;
  }

  return (
    <html
      lang="ro"
      className={`${inter.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteChrome user={navUser}>{children}</SiteChrome>
        <Toaster richColors closeButton position="top-center" />
      </body>
    </html>
  );
}
