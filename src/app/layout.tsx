import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Memo App",
  description: "A simple memo app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
