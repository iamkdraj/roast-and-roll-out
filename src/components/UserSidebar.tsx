
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, FileText, Heart, LogOut, TrendingUp, TrendingDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getRandomAvatarColor, getAvatarInitials } from "@/utils/avatarUtils";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UserSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserSidebar = ({ isOpen, onClose }: UserSidebarProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalPosts: 0, totalUpvotes: 0, totalDownvotes: 0 });
  const [username, setUsername] = useState("Anonymous");

  useEffect(() => {
    if (user) {
      fetchUserStats();
      fetchUsername();
    }
  }, [user]);

  const fetchUsername = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .maybeSingle();
    
    if (data?.username) {
      setUsername(data.username);
    }
  };

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      const { data: postsData } = await supabase
        .from('posts')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'visible');

      if (postsData) {
        const postIds = postsData.map(p => p.id);
        
        if (postIds.length > 0) {
          const votePromises = postIds.map(postId => 
            supabase.rpc('get_vote_counts', { post_uuid: postId })
          );
          
          const voteResults = await Promise.all(votePromises);
          
          let totalUpvotes = 0;
          let totalDownvotes = 0;
          
          voteResults.forEach(result => {
            if (result.data) {
              totalUpvotes += result.data.upvotes || 0;
              totalDownvotes += result.data.downvotes || 0;
            }
          });
          
          setStats({
            totalPosts: postsData.length,
            totalUpvotes,
            totalDownvotes
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleLogout = async () => {
    await signOut();
    onClose();
    navigate("/");
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  if (!user) {
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
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Menu</h2>
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Please log in to access your profile</p>
                  <Button onClick={() => handleNavigation("/auth")}>
                    Log In / Sign Up
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  const avatarColor = getRandomAvatarColor(username);

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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Menu</h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* User Avatar and Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-6"
              >
                <Avatar className="h-16 w-16 mx-auto mb-3">
                  <AvatarFallback className={`${avatarColor} text-white text-xl font-bold`}>
                    {getAvatarInitials(username)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-lg">{username}</h3>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex gap-2 mb-6"
              >
                <div className="flex-1 p-3 bg-background rounded-lg border text-center">
                  <FileText className="w-4 h-4 mx-auto mb-1 text-primary" />
                  <div className="text-sm font-semibold">{stats.totalPosts}</div>
                  <div className="text-xs text-muted-foreground">Posts</div>
                </div>
                <div className="flex-1 p-3 bg-background rounded-lg border text-center">
                  <TrendingUp className="w-4 h-4 mx-auto mb-1 text-green-500" />
                  <div className="text-sm font-semibold text-green-500">{stats.totalUpvotes}</div>
                  <div className="text-xs text-muted-foreground">Upvotes</div>
                </div>
                <div className="flex-1 p-3 bg-background rounded-lg border text-center">
                  <TrendingDown className="w-4 h-4 mx-auto mb-1 text-red-500" />
                  <div className="text-sm font-semibold text-red-500">{stats.totalDownvotes}</div>
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
                  My Posts
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleNavigation("/saved")}
                >
                  <Heart className="w-4 h-4 mr-3" />
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
                  className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Logout
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
