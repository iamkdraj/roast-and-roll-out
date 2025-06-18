
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, Settings } from "lucide-react";
import { UserSidebar } from "./UserSidebar";
import { SettingsSidebar } from "./SettingsSidebar";
import { motion } from "framer-motion";

export const TopBar = () => {
  const [isUserSidebarOpen, setIsUserSidebarOpen] = useState(false);
  const [isSettingsSidebarOpen, setIsSettingsSidebarOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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

  return (
    <>
      <motion.header
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-sm border-b border-border"
      >
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between h-12">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsUserSidebarOpen(true)}
                className="h-9 w-9"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold text-primary"
            >
              Roastr
            </motion.h1>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSettingsSidebarOpen(true)}
                className="h-9 w-9"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </motion.div>
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
