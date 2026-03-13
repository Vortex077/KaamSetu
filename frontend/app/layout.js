import { Inter, Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Navbar from "../components/Navbar";
import ServiceWorkerRegister from "../components/ServiceWorkerRegister";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata = {
  title: "KaamSetu - Bridging Skills with Opportunities",
  description: "India's Bridge to Work for the informal sector.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-slate-50 text-slate-900 min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-grow flex flex-col">
          {children}
        </main>
        <ServiceWorkerRegister />
        <Toaster position="top-center" toastOptions={{
          style: {
            background: '#1E293B',
            color: '#fff',
            borderRadius: '12px',
          },
          success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#F43F5E', secondary: '#fff' } },
        }} />
      </body>
    </html>
  );
}
