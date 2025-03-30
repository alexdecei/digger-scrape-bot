import "../index.css";
import "../App.css";
import Providers from "@/components/Providers";

export const metadata = {
  title: 'Digger',
  description: 'Interface de contrôle du bot Playwright',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
