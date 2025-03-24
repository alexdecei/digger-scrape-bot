
import { useState, useRef, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useToast } from '@/hooks/use-toast';
import { LockIcon, KeyIcon, ArrowRightIcon } from 'lucide-react';

interface PasswordGateProps {
  onAuthenticate: () => void;
  correctPassword: string;
}

const PasswordGate = ({ onAuthenticate, correctPassword }: PasswordGateProps) => {
  const [password, setPassword] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Focus the input when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === correctPassword) {
      setIsAnimating(true);
      
      // Animate out and then authenticate
      setTimeout(() => {
        onAuthenticate();
        toast({
          title: "Access Granted",
          description: "Welcome to Digger.",
        });
      }, 600);
    } else {
      toast({
        title: "Access Denied",
        description: "Incorrect password. Please try again.",
        variant: "destructive",
      });
      
      // Shake animation
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-background to-background/95 flex items-center justify-center z-50 p-4">
      <div 
        className={`w-full max-w-md p-8 glass-panel animate-scale-in 
                   ${isAnimating ? (password === correctPassword ? 'animate-fade-out' : 'animate-[shake_0.5s_ease-in-out]') : ''}`}
      >
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 bg-primary/5 rounded-full flex items-center justify-center mb-6">
            <LockIcon className="h-7 w-7 text-primary/80" />
          </div>
          <h1 className="text-2xl font-bold title-gradient">Digger</h1>
          <p className="text-muted-foreground mt-2">Enter password to access the application</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70">
              <KeyIcon className="h-4 w-4" />
            </div>
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-input w-full h-10 pl-10 pr-4 focus:outline-none"
              placeholder="Enter password..."
              autoFocus
            />
          </div>
          
          <button 
            type="submit"
            className="primary-button w-full group"
          >
            Access Digger
            <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordGate;
