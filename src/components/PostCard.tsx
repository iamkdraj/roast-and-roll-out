import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ThumbsUp, ThumbsDown, Bookmark, MoreHorizontal, Flag, AlertTriangle, Trash2, Share, ChevronDown, ChevronUp, Edit2 } from "lucide-react";
import { Post } from "@/hooks/usePosts";
import { useAuth } from "@/hooks/useAuth";
import { getRandomAvatarColor, getAvatarInitials } from "@/utils/avatarUtils";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EditPost } from "@/components/EditPost";

interface PostCardProps {
  post: Post;
  onVote: (postId: string, voteType: "upvote" | "downvote") => void;
  onSave: (postId: string) => void;
  onReport: (postId: string) => void;
  onDelete: (postId: string) => void;
  onEdit: (postId: string, content: string) => Promise<void>;
  showNSFW: boolean;
  onUsernameClick?: (userId: string) => void;
}

export const PostCard = ({ post, onVote, onSave, onReport, onDelete, onEdit, showNSFW, onUsernameClick }: PostCardProps) => {
  const { user } = useAuth();
  const [showContent, setShowContent] = useState(!post.isNSFW || showNSFW);
  const [showMoreTags, setShowMoreTags] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

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
  const canEdit = user && post.user_id === user.id;
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
  const visibleTags = displayTags.slice(0, 2);
  const hiddenTags = displayTags.slice(2);

  return (
    <>
      <Card className="post-card mb-6">
        <CardContent className="p-4 space-y-4">
          {/* Header with Avatar and User Info */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <div className={`avatar w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getRandomAvatarColor(post.username)}`}>
                {getAvatarInitials(post.username)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleUsernameClick}
                    className={`font-semibold text-foreground interactive ${
                      !post.isAnonymous && post.user_id 
                        ? 'hover:text-primary cursor-pointer' 
                        : 'cursor-default'
                    }`}
                    disabled={post.isAnonymous || !post.user_id}
                  >
                    {post.username}
                  </button>
                  <div className="flex items-center space-x-2">
                    {/* Tags - Only emojis, smaller, on the right */}
                    {displayTags.length > 0 && (
                      <div className="flex items-center gap-1">
                        {visibleTags.map((tag, index) => (
                          <span key={index} className="text-lg tag p-0.5">
                            {tag.emoji}
                          </span>
                        ))}
                        {hiddenTags.length > 0 && (
                          <Collapsible open={showMoreTags} onOpenChange={setShowMoreTags}>
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 interactive">
                                <ChevronDown className={`w-4 h-4 transition-transform ${showMoreTags ? 'rotate-180' : ''}`} />
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="dropdown-content absolute right-0 mt-2">
                              <div className="flex flex-wrap gap-1 p-2">
                                {hiddenTags.map((tag, index) => (
                                  <span key={index} className="text-lg tag p-0.5">
                                    {tag.emoji}
                                  </span>
                                ))}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        )}
                      </div>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="action-button p-1.5 rounded-lg interactive">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="dropdown-content">
                        {canEdit && (
                          <DropdownMenuItem
                            onClick={() => setShowEditDialog(true)}
                            className="text-primary hover:text-primary/90 hover:bg-primary/10 cursor-pointer interactive"
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => onReport(post.id)}
                          className="text-red-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer interactive"
                        >
                          <Flag className="w-4 h-4 mr-2" />
                          Report
                        </DropdownMenuItem>
                        {canDelete && (
                          <DropdownMenuItem
                            onClick={() => setShowDeleteConfirm(true)}
                            className="text-red-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer border-t border-border interactive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="text-muted-foreground text-sm">{timeAgo}</div>
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-foreground">{post.title}</h2>

          {/* Content */}
          {showContent ? (
            <div className="text-foreground whitespace-pre-wrap leading-relaxed text-lg">
              {post.content}
            </div>
          ) : (
            <div className="p-3 bg-muted/50 rounded-lg border-l-4 border-red-500">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span className="text-red-500 font-medium">NSFW Content</span>
              </div>
              <p className="text-muted-foreground text-sm mb-2">
                This post may contain sensitive content. Click to view.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowContent(true)}
                className="border-red-500/50 text-red-500 hover:bg-red-500/10 interactive"
              >
                Show Content
              </Button>
            </div>
          )}

          {/* Actions Bar */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onVote(post.id, "upvote")}
                className={`action-button px-2 py-1 rounded-lg interactive ${
                  post.userVote === "upvote" 
                    ? "text-green-500" 
                    : "hover:text-green-500"
                }`}
              >
                <ThumbsUp className="w-4 h-4 mr-1" />
                {post.upvotes}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onVote(post.id, "downvote")}
                className={`action-button px-2 py-1 rounded-lg interactive ${
                  post.userVote === "downvote" 
                    ? "text-red-500" 
                    : "hover:text-red-500"
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
                className={`action-button p-1 rounded-lg interactive ${
                  post.isSaved 
                    ? "text-blue-500" 
                    : "hover:text-blue-500"
                }`}
              >
                <Bookmark className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="action-button p-1 rounded-lg hover:text-primary interactive"
              >
                <Share className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          onDelete(post.id);
          setShowDeleteConfirm(false);
        }}
        title="Delete Post"
        description="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete"
      />

      {/* Edit Dialog */}
      {showEditDialog && (
        <EditPost
          post={post}
          onClose={() => setShowEditDialog(false)}
          onSave={async (content) => {
            await onEdit(post.id, content);
            setShowEditDialog(false);
          }}
        />
      )}
    </>
  );
};
