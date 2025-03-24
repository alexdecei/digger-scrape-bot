
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 flex flex-col">
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-10">
        <div className="container flex h-14 items-center">
          <div className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M9 9V4.5a1.5 1.5 0 0 1 3 0V9M9 9h3M9 9H6.5a1.5 1.5 0 0 0 0 3h.5" />
              <path d="M12 12h2.5a1.5 1.5 0 0 1 0.5 2.915c-.195.349-.31.708-.342 1.085" />
              <path d="M16 21v-2a4 4 0 0 0-4-4h-.5" />
              <path d="M3 12a9 9 0 0 0 9 9" />
            </svg>
            <span className="font-semibold">Digger</span>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;
