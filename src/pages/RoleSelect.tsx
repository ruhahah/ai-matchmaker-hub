import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sun, Users, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RoleSelect() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const choose = (role: 'volunteer' | 'organizer') => {
    login(role);
    navigate(`/${role}`);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="mb-12 flex flex-col items-center gap-4 animate-slide-up">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary ai-glow">
          <Sun className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Sun Proactive AI Exchange
        </h1>
        <p className="max-w-md text-center text-muted-foreground">
          AI-powered volunteering that matches the right people to the right tasks.
        </p>
      </div>

      <div className="grid w-full max-w-lg gap-6 sm:grid-cols-2">
        <Card
          className="group cursor-pointer border-2 border-transparent transition-all hover:border-primary hover:shadow-lg hover:ai-glow"
          onClick={() => choose('volunteer')}
        >
          <CardContent className="flex flex-col items-center gap-4 p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-colors group-hover:gradient-primary group-hover:text-primary-foreground">
              <Users className="h-7 w-7" />
            </div>
            <div className="text-center">
              <h2 className="font-display text-lg font-semibold">I am a Volunteer</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Find tasks matched to your skills
              </p>
            </div>
            <Button variant="outline" className="w-full">Get Started</Button>
          </CardContent>
        </Card>

        <Card
          className="group cursor-pointer border-2 border-transparent transition-all hover:border-secondary hover:shadow-lg"
          onClick={() => choose('organizer')}
        >
          <CardContent className="flex flex-col items-center gap-4 p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-colors group-hover:gradient-secondary group-hover:text-secondary-foreground">
              <ClipboardList className="h-7 w-7" />
            </div>
            <div className="text-center">
              <h2 className="font-display text-lg font-semibold">I am an Organizer</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Create tasks and find volunteers
              </p>
            </div>
            <Button variant="outline" className="w-full">Get Started</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
