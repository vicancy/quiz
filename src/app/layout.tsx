import "./globals.css";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-transparent min-h-screen font-sans text-primary-foreground">
        <div className="flex flex-col min-h-screen">
          <header className="w-full border-b border-border bg-background py-4 px-6 flex items-center justify-center shadow">
            <span className="text-2xl font-bold tracking-tight text-primary">Quiz Game / Azure Services / DevDiv</span>
          </header>
          <main className="flex-1 flex flex-col items-center justify-center">{children}</main>
          <footer className="w-full border-t border-border bg-background py-3 text-center text-muted-foreground text-sm">&copy; {new Date().getFullYear()} Team Fair Event. All rights reserved.</footer>
        </div>
      </body>
    </html>
  );
}
