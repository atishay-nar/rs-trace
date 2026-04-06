import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { auth, signOut } from "@/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Research Tracker",
  description: "Track research papers",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {session?.user && (
          <div className="w-full border-b border-[var(--divide)] px-4 py-2 flex items-center justify-end gap-4 text-sm">
            <span className="text-[var(--muted)]">{session.user.name ?? session.user.email}</span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button type="submit" className="text-[var(--accent)] hover:underline">
                Sign out
              </button>
            </form>
          </div>
        )}
        <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-10 sm:px-6 sm:py-14">
          {children}
        </main>
      </body>
    </html>
  );
}
