import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { getSession } from "@/features/auth/lib/auth";
import { getUserPermissions } from "@/features/auth/services/permission.service";
import { PermissionsProvider } from "@/features/auth/components/permissions-provider";
import { ThemeProvider } from "@/components/shared/providers/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Biometrico App",
  description: "Sistema de gestión biométrica",
};

export default async function RootLayout({ children }) {
  const session = await getSession();
  // Si hay sesión, buscamos sus permisos. Si no, array vacío.
  // Nota: session.role debe coincidir con el nombre del rol en DB.
  const permissions = session ? await getUserPermissions(session.role) : [];

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var p=localStorage.getItem("theme-preset");if(p){document.documentElement.dataset.preset=p;}}catch(e){}})();',
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <PermissionsProvider permissions={permissions}>
            {children}
          </PermissionsProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
