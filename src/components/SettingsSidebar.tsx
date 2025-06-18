
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { X, Settings, Moon, Sun, Eye, EyeOff } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useState, useEffect } from "react";

interface SettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsSidebar = ({ isOpen, onClose }: SettingsSidebarProps) => {
  const { theme, setTheme } = useTheme();
  const [showNSFW, setShowNSFW] = useState(false);

  useEffect(() => {
    setShowNSFW(localStorage.getItem('showNSFW') === 'true');
  }, []);

  const handleNSFWToggle = (checked: boolean) => {
    setShowNSFW(checked);
    localStorage.setItem('showNSFW', checked.toString());
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-80 bg-card border-l border-border z-50 overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <h2 className="text-lg font-semibold">Settings</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Theme Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 mb-6"
              >
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Appearance</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      {theme === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      <Label htmlFor="theme-toggle">Dark Mode</Label>
                    </div>
                    <Switch
                      id="theme-toggle"
                      checked={theme === 'dark'}
                      onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Content Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4 mb-6"
              >
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Content</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      {showNSFW ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      <div>
                        <Label htmlFor="nsfw-toggle">Show NSFW Content</Label>
                        <p className="text-xs text-muted-foreground">Show posts marked as sensitive</p>
                      </div>
                    </div>
                    <Switch
                      id="nsfw-toggle"
                      checked={showNSFW}
                      onCheckedChange={handleNSFWToggle}
                    />
                  </div>
                </div>
              </motion.div>

              {/* App Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="pt-6 border-t border-border"
              >
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">About</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Roastr v1.0.0</p>
                  <p>Where jokes get roasted</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
