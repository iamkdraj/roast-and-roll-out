
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Bookmark, FileText, LogOut, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface UserSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserSidebar = ({ isOpen, onClose }: UserSidebarProps) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      onClose();
      navigate("/");
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error("Failed to log out");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
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
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-80 bg-card border-r border-border z-50 overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Menu</h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {user ? (
                <>
                  {/* User Info */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-3 mb-6 p-4 rounded-lg bg-muted/50"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={profile?.avatar_url || ""} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {profile?.username?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{profile?.username || "User"}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </motion.div>

                  {/* Stats */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-3 gap-3 mb-6"
                  >
                    <div className="text-center p-3 rounded-lg bg-muted/30">
                      <div className="text-lg font-bold text-primary">0</div>
                      <div className="text-xs text-muted-foreground">Posts</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/30">
                      <div className="text-lg font-bold text-green-600">0</div>
                      <div className="text-xs text-muted-foreground">Upvotes</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/30">
                      <div className="text-lg font-bold text-red-600">0</div>
                      <div className="text-xs text-muted-foreground">Downvotes</div>
                    </div>
                  </motion.div>

                  {/* Menu Items */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-2"
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleNavigation("/profile")}
                    >
                      <User className="w-4 h-4 mr-3" />
                      My Profile
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleNavigation("/profile")}
                    >
                      <FileText className="w-4 h-4 mr-3" />
                      My Posts
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleNavigation("/saved")}
                    >
                      <Bookmark className="w-4 h-4 mr-3" />
                      Saved Posts
                    </Button>
                  </motion.div>

                  {/* Logout */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 pt-6 border-t border-border"
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      {isLoggingOut ? "Logging out..." : "Logout"}
                    </Button>
                  </motion.div>
                </>
              ) : (
                /* Guest Menu */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Welcome to Roastr!</h3>
                  <p className="text-muted-foreground mb-6">
                    Sign in to create posts, vote, and save your favorites.
                  </p>
                  <Button
                    onClick={() => handleNavigation("/auth")}
                    className="w-full"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In / Sign Up
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
