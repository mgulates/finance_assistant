import type { Metadata } from "next";
import "./globals.css";
import MainLayout from "@/components/MainLayout";

export const metadata: Metadata = {
  title: "Finance Assistant - Kişisel Finans Asistanı",
  description: "Öğrenciler için yapay zeka destekli kişisel finans asistanı",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
