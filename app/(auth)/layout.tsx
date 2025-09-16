import "@/app/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication | Magna Coders",
  description: "Join our developer community",
};

export const viewport = {
  themeColor: "#F9E4AD",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-black text-white">{children}</div>;
}
