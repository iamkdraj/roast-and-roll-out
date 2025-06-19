
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, Settings, ArrowLeft } from "lucide-react";
import { UserSidebar } from "./UserSidebar";
import { SettingsSidebar } from "./SettingsSidebar";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";

interface TopBarProps {
  customTitle?: string;
  showBackButton?: boolean;
}

export const TopBar = ({ customTitle, showBackButton }: TopBarProps) => {
  const [isUserSidebarOpen, setIsUserSidebarOpen] = useState(false);
  const [isSettingsSidebarOpen, setIsSettingsSidebarOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past 100px
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const getPageTitle = () => {
    if (customTitle) return customTitle;
    
    switch (location.pathname) {
      case "/leaderboard": return "Leaderboard";
      case "/profile": return "My Profile";
      case "/saved": return "Saved Posts";
      case "/create": return "Create Post";
      default: return "Roastr";
    }
  };

  const shouldShowBackButton = () => {
    return showBackButton || location.pathname !== "/";
  };

  return (
    <>
      <motion.header
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 left-0 right-0 z-40 bg-background/95 dark:bg-background/95 backdrop-blur-md border-b border-border/60 dark:border-border/60"
        style={{ 
          backgroundColor: 'rgba(var(--background), 0.95)',
          backdropFilter: 'blur(12px)'
        }}
      >
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between h-8">
            <div className="flex items-center space-x-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsUserSidebarOpen(true)}
                  className="h-8 w-8"
                >
                  <Menu className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold text-primary flex-1 text-center"
            >
              {getPageTitle()}
            </motion.h1>

            <div className="flex items-center space-x-2">
              {shouldShowBackButton() && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate("/")}
                    className="h-8 w-8"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}
              
              <motion.div
                whileHover={{ scale: 1.05, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSettingsSidebarOpen(true)}
                  className="h-8 w-8"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      <UserSidebar
        isOpen={isUserSidebarOpen}
        onClose={() => setIsUserSidebarOpen(false)}
      />
      
      <SettingsSidebar
        isOpen={isSettingsSidebarOpen}
        onClose={() => setIsSettingsSidebarOpen(false)}
      />
    </>
  );
};
