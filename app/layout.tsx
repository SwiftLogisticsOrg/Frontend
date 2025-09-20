import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/components/SocketProvider";
import { NotificationProvider } from "@/context/NotificationContext";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SwiftTrack - Modern Logistics Platform",
  description:
    "Connect clients and drivers for seamless delivery experiences with real-time tracking.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <NotificationProvider>
            <SocketProvider>
              {children}
              <Toaster />
            </SocketProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
