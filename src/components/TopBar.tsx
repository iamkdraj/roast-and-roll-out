import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X, User, LogOut, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export const TopBar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left side - Logo and Navigation */}
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2 translate-x-4">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Roastr
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === "/" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Home
            </Link>
            <Link
              to="/leaderboard"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === "/leaderboard" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Leaderboard
            </Link>
            <Link
              to="/saved"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === "/saved" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Saved
            </Link>
          </nav>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-4 translate-x-[-1rem]">
          <ThemeToggle />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full interactive">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.user_metadata.avatar_url} alt={user.email || "User"} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user.email?.[0].toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="dropdown-content">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer interactive">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer interactive">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="text-red-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer interactive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-3">
              <Button variant="ghost" asChild className="interactive">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild className="interactive">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}; 