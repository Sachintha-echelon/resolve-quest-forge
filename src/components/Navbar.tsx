import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { TicketIcon, LogOut, User, BookOpen, LayoutDashboard, Users, BarChart3, Star } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  if (!user) return null;

  return (
    <nav className="border-b bg-card shadow-soft sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <TicketIcon className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-foreground">SupportHub</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <Button
                variant={isActive('/dashboard') ? 'default' : 'ghost'}
                asChild
                size="sm"
              >
                <Link to="/dashboard">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              <Button
                variant={isActive('/tickets') ? 'default' : 'ghost'}
                asChild
                size="sm"
              >
                <Link to="/tickets">
                  <TicketIcon className="w-4 h-4 mr-2" />
                  Tickets
                </Link>
              </Button>
              <Button
                variant={isActive('/blog') ? 'default' : 'ghost'}
                asChild
                size="sm"
              >
                <Link to="/blog">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Blog
                </Link>
              </Button>
              {user.role === 'admin' && (
                <>
                  <Button
                    variant={isActive('/users') ? 'default' : 'ghost'}
                    asChild
                    size="sm"
                  >
                    <Link to="/users">
                      <Users className="w-4 h-4 mr-2" />
                      Users
                    </Link>
                  </Button>
                  <Button
                    variant={isActive('/analytics') ? 'default' : 'ghost'}
                    asChild
                    size="sm"
                  >
                    <Link to="/analytics">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Analytics
                    </Link>
                  </Button>
                  <Button
                    variant={isActive('/reviews') ? 'default' : 'ghost'}
                    asChild
                    size="sm"
                  >
                    <Link to="/reviews">
                      <Star className="w-4 h-4 mr-2" />
                      Reviews
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role.replace('_', ' ')}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
