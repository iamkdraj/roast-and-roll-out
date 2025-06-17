
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ThumbsUp, ThumbsDown, Bookmark, MoreHorizontal, Flag, AlertTriangle, Trash2, Share } from "lucide-react";
import { Post } from "@/hooks/usePosts";
import { useAuth } from "@/hooks/useAuth";
import { getRandomAvatarColor, getAvatarInitials } from "@/utils/avatarUtils";
import { toast } from "sonner";

interface PostCardProps {
  post: Post;
  onVote: (postId: string, voteType: "upvote" | "downvote") => void;
  onSave: (postId: string) => void;
  onReport: (postId: string) => void;
  onDelete: (postId: string) => void;
  showNSFW: boolean;
  onUsernameClick?: (userId: string) => void;
}

export const PostCard = ({ post, onVote, onSave, onReport, onDelete, showNSFW, onUsernameClick }: PostCardProps) => {
  const { user } = useAuth();
  const [showContent, setShowContent] = useState(!post.isNSFW || showNSFW);

  const handleUsernameClick = () => {
    if (onUsernameClick && post.user_id && !post.isAnonymous) {
      onUsernameClick(post.user_id);
    }
  };

  const handleShare = async () => {
    const shareText = `Check out this roast: ${post.content.substring(0, 100)}...`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Roastr Post',
          text: shareText,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
        toast.success("Link copied to clipboard!");
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        toast.error("Failed to copy link");
      }
    }
  };

  const canDelete = user && post.user_id === user.id;
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    else if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    else if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    else return 'Just now';
  };

  const timeAgo = formatDate(post.createdAt);
  const displayTags = post.tags.filter(tag => !['Hindi', 'Hinglish', 'English'].includes(tag.name));

  return (
    <Card className="bg-card border-border hover:border-primary/30 transition-all duration-200 shadow-sm hover:shadow-md">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header with Avatar and User Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getRandomAvatarColor(post.username)}`}>
                {getAvatarInitials(post.username)}
              </div>
              <div>
                <button
                  onClick={handleUsernameClick}
                  className={`font-semibold text-foreground ${
                    !post.isAnonymous && post.user_id 
                      ? 'hover:text-primary cursor-pointer transition-colors' 
                      : 'cursor-default'
                  }`}
                  disabled={post.isAnonymous || !post.user_id}
                >
                  {post.username}
                </button>
                <div className="text-muted-foreground text-sm">{timeAgo}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Tags - Smaller and on the right */}
              {displayTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {displayTags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className={`text-xs px-2 py-0.5 ${
                        tag.name === 'NSFW' 
                          ? 'bg-red-600/20 text-red-400 border-red-600/30'
                          : 'bg-primary/10 text-primary/80 border-primary/20'
                      }`}
                    >
                      {tag.emoji} {tag.name}
                    </Badge>
                  ))}
                </div>
              )}
              
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(post.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Content */}
          {showContent ? (
            <div className="text-foreground whitespace-pre-wrap leading-relaxed">
              {post.content}
            </div>
          ) : (
            <div className="p-4 bg-muted/50 rounded-lg border border-red-600/30">
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-medium">NSFW Content</span>
              </div>
              <p className="text-muted-foreground text-sm mb-3">
                This post may contain sensitive content. Click to view.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowContent(true)}
                className="border-red-600/50 text-red-400 hover:bg-red-600/10"
              >
                Show Content
              </Button>
            </div>
          )}

          {/* Actions Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onVote(post.id, "upvote")}
                className={`px-3 py-1 rounded-full transition-colors ${
                  post.userVote === "upvote" 
                    ? "text-green-400 bg-green-400/10" 
                    : "text-muted-foreground hover:text-green-400 hover:bg-green-400/10"
                }`}
              >
                <ThumbsUp className="w-4 h-4 mr-1.5" />
                {post.upvotes}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onVote(post.id, "downvote")}
                className={`px-3 py-1 rounded-full transition-colors ${
                  post.userVote === "downvote" 
                    ? "text-red-400 bg-red-400/10" 
                    : "text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
                }`}
              >
                <ThumbsDown className="w-4 h-4 mr-1.5" />
                {post.downvotes}
              </Button>
            </div>

            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSave(post.id)}
                className={`p-2 rounded-full transition-colors ${
                  post.isSaved 
                    ? "text-blue-400 bg-blue-400/10" 
                    : "text-muted-foreground hover:text-blue-400 hover:bg-blue-400/10"
                }`}
              >
                <Bookmark className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="text-muted-foreground hover:text-primary hover:bg-primary/10 p-2 rounded-full transition-colors"
              >
                <Share className="w-4 h-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground p-2 rounded-full">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-card border-border">
                  <DropdownMenuItem
                    onClick={() => onReport(post.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20 cursor-pointer"
                  >
                    <Flag className="w-4 h-4 mr-2" />
                    Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
