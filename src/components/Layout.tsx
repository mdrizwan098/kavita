import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { auth } from '../lib/firebase';
import { Button } from './ui/button';
import { PenLine, User as UserIcon, LogOut, Home, Search, Moon, Sun } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { cn } from '../lib/utils';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDark, setIsDark] = React.useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 flex flex-col relative overflow-hidden">
      {/* Paper Texture Overlay */}
      <div className="fixed inset-0 paper-texture z-0" />
      
      {/* Decorative Background Elements */}
      <div className="fixed -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -bottom-24 -right-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-background/60 backdrop-blur-md">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between max-w-5xl">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-3xl font-display font-bold tracking-tighter italic group-hover:text-primary transition-colors">Kavita</span>
          </Link>

          <nav className="flex items-center gap-6">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full hover:bg-primary/10">
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {user ? (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn("rounded-full hover:bg-primary/10", location.pathname === '/write' && 'text-primary bg-primary/5')}
                  onClick={() => navigate('/write')}
                >
                  <PenLine className="h-5 w-5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger className="relative h-10 w-10 rounded-full p-0 border border-primary/20 hover:border-primary/40 transition-colors flex items-center justify-center overflow-hidden hover:bg-primary/5">
                    <Avatar className="h-full w-full">
                      <AvatarImage src={user.photoURL || ''} alt={profile?.username} />
                      <AvatarFallback className="bg-primary/5 text-primary font-display">{profile?.username?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-2xl border-primary/10 bg-background/95 backdrop-blur-md">
                    <DropdownMenuItem onClick={() => navigate(`/profile/${user.uid}`)} className="rounded-xl focus:bg-primary/10 cursor-pointer py-3">
                      <UserIcon className="mr-3 h-4 w-4 text-primary" />
                      <span className="font-medium">My Journal</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="rounded-xl focus:bg-destructive/10 text-destructive cursor-pointer py-3">
                      <LogOut className="mr-3 h-4 w-4" />
                      <span className="font-medium">Depart</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button 
                variant="outline" 
                className="rounded-full border-primary/20 hover:bg-primary/5 hover:border-primary/40 px-6"
                onClick={() => navigate('/auth')}
              >
                Login
              </Button>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 relative z-10 container mx-auto px-6 py-12 max-w-3xl">
        {children}
      </main>

      <footer className="relative z-10 border-t border-primary/10 py-12 mt-auto bg-background/40 backdrop-blur-sm">
        <div className="container mx-auto px-6 text-center max-w-5xl">
          <p className="font-display italic text-xl text-primary/80">"Poetry is the spontaneous overflow of powerful feelings."</p>
          <div className="mt-6 flex flex-col items-center gap-2">
            <div className="w-12 h-px bg-primary/20" />
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground/60">Kavita • A Sanctuary for Words</p>
            <p className="text-[10px] text-muted-foreground/40">© {new Date().getFullYear()}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
