
import { Link, useLocation } from "react-router-dom";
import { Home, Trophy, Bookmark, User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { motion, Variants } from "framer-motion";

export const BottomBar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const iconVariants: Variants = {
    hover: { 
      scale: 1.15, 
      y: -3,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: { 
      scale: 0.9,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      className="fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-md border-t border-border"
      style={{ 
        backgroundColor: 'hsl(var(--background) / 0.95)',
        backdropFilter: 'blur(12px)',
        height: '64px'
      }}
    >
      <div className="container mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full">
          <Link
            to="/"
            className={`flex items-center justify-center flex-1 transition-colors ${
              isActive("/") ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <motion.div
              variants={iconVariants}
              whileHover="hover"
              whileTap="tap"
              className="p-2 rounded-lg transition-colors"
            >
              <Home className={`w-5 h-5 ${isActive("/") ? "text-primary" : ""}`} />
            </motion.div>
          </Link>

          <Link
            to="/leaderboard"
            className={`flex items-center justify-center flex-1 transition-colors ${
              isActive("/leaderboard") ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <motion.div
              variants={iconVariants}
              whileHover="hover"
              whileTap="tap"
              className="p-2 rounded-lg transition-colors"
            >
              <Trophy className={`w-5 h-5 ${isActive("/leaderboard") ? "text-primary" : ""}`} />
            </motion.div>
          </Link>

          <div className="flex-1 flex justify-center">
            <motion.div
              whileHover={{ 
                scale: 1.1,
                transition: {
                  type: "spring",
                  stiffness: 400,
                  damping: 10
                }
              }}
              whileTap={{ 
                scale: 0.9,
                transition: {
                  type: "spring",
                  stiffness: 400,
                  damping: 10
                }
              }}
            >
              <Button
                asChild
                className="w-12 h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link to="/create">
                  <Plus className="w-5 h-5" />
                </Link>
              </Button>
            </motion.div>
          </div>

          <Link
            to="/saved"
            className={`flex items-center justify-center flex-1 transition-colors ${
              isActive("/saved") ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <motion.div
              variants={iconVariants}
              whileHover="hover"
              whileTap="tap"
              className="p-2 rounded-lg transition-colors"
            >
              <Bookmark className={`w-5 h-5 ${isActive("/saved") ? "text-primary" : ""}`} />
            </motion.div>
          </Link>

          <Link
            to={user ? "/profile" : "/auth"}
            className={`flex items-center justify-center flex-1 transition-colors ${
              isActive("/profile") || isActive("/auth") ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <motion.div
              variants={iconVariants}
              whileHover="hover"
              whileTap="tap"
              className="p-2 rounded-lg transition-colors"
            >
              <User className={`w-5 h-5 ${isActive("/profile") || isActive("/auth") ? "text-primary" : ""}`} />
            </motion.div>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
