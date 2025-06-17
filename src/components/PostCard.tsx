import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ThumbsUp, ThumbsDown, Bookmark, MoreHorizontal, Flag, AlertTriangle, Trash2 } from "lucide-react";
import { Post } from "@/hooks/usePosts";
import { useAuth } from "@/hooks/useAuth";
import { getRandomAvatarColor, getAvatarInitials } from "@/utils/avatarUtils";

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

  const canDelete = user && post.user_id === user.id;

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const timeAgo = formatDate(post.createdAt);

  return (
    <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {/* Avatar */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getRandomAvatarColor(post.username)}`}>
            {getAvatarInitials(post.username)}
          </div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center space-x-2 mb-2">
              <button
                onClick={handleUsernameClick}
                className={`font-semibold text-white ${
                  !post.isAnonymous && post.user_id 
                    ? 'hover:text-orange-500 cursor-pointer' 
                    : 'cursor-default'
                }`}
                disabled={post.isAnonymous || !post.user_id}
              >
                {post.username}
              </button>
              <span className="text-gray-500 text-sm">{timeAgo}</span>
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(post.id)}
                  className="ml-auto text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {post.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className={`text-xs px-2 py-1 ${
                      tag.name === 'NSFW' 
                        ? 'bg-red-600/20 text-red-400 border-red-600/30'
                        : 'bg-orange-600/20 text-orange-400 border-orange-600/30'
                    }`}
                  >
                    {tag.emoji} {tag.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Content */}
            {showContent ? (
              <p className="text-gray-300 whitespace-pre-wrap mb-4">{post.content}</p>
            ) : (
              <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-red-600/30">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 font-medium">NSFW Content</span>
                </div>
                <p className="text-gray-400 text-sm mb-3">
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

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onVote(post.id, "upvote")}
                  className={`text-gray-400 hover:text-green-400 ${
                    post.userVote === "upvote" ? "text-green-400" : ""
                  }`}
                >
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  {post.upvotes}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onVote(post.id, "downvote")}
                  className={`text-gray-400 hover:text-red-400 ${
                    post.userVote === "downvote" ? "text-red-400" : ""
                  }`}
                >
                  <ThumbsDown className="w-4 h-4 mr-1" />
                  {post.downvotes}
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSave(post.id)}
                  className={`text-gray-400 hover:text-blue-400 ${
                    post.isSaved ? "text-blue-400" : ""
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-300">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-800 border-gray-700">
                    <DropdownMenuItem
                      onClick={() => onReport(post.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <Flag className="w-4 h-4 mr-2" />
                      Report
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
