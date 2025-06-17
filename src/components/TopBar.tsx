import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogIn, Settings, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { motion, Variants } from "framer-motion";
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

  const iconVariants: Variants = {
    hover: { 
      scale: 1.1, 
      y: -1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: { 
      scale: 0.95,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-md"
    >
      <div className="container flex h-12 items-center justify-between px-4">
        {/* Left side - Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <motion.span 
            className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
            whileHover={{ 
              scale: 1.05,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 10
              }
            }}
            whileTap={{ 
              scale: 0.95,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 10
              }
            }}
          >
            Roastr
          </motion.span>
        </Link>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div
                  variants={iconVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full interactive">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata.avatar_url} alt={user.email || "User"} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.email?.[0].toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </motion.div>
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
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <motion.div
                variants={iconVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-full">
                  <Link to="/auth">
                    <LogIn className="w-5 h-5" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div
                variants={iconVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-full">
                  <Link to="/settings">
                    <Settings className="w-5 h-5" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
}; 