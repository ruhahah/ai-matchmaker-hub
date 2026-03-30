import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Sun } from 'lucide-react';

export function AppHeader() {
  const { role, logout } = useAuth();

  if (!role) return null;

  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
            <Sun className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">
            Sun Proactive AI
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold capitalize text-accent-foreground">
            {role}
          </span>
          <Button variant="ghost" size="sm" onClick={logout} className="gap-2 text-muted-foreground">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
