
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MessageSquare } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';

interface CommentsSectionProps {
  applicationId: string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

interface Comment {
  id: string;
  application_id: string;
  comment: string;
  type: string;
  created_at: string;
}

export const CommentsSection = ({ applicationId, messagesEndRef }: CommentsSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchComments = async () => {
      if (!applicationId) return;
      setIsLoading(true);
      try {
        const { data: commentsData, error } = await supabase
          .from('application_comments')
          .select('*')
          .eq('application_id', applicationId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error("Error fetching comments:", error);
          toast({
            title: "Error",
            description: "Failed to load comments.",
            variant: "destructive",
          });
        } else {
          setComments(commentsData || []);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [applicationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments, messagesEndRef]);

  const handlePostComment = async () => {
    if (!newComment.trim() || !applicationId) {
      toast({
        title: "Warning",
        description: "Please enter a comment.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('application_comments')
        .insert([{
          application_id: applicationId,
          comment: newComment,
          type: 'comment'
        }])
        .select()
        .single();

      if (error) {
        console.error("Error posting comment:", error);
        toast({
          title: "Error",
          description: "Failed to post comment.",
          variant: "destructive",
        });
      } else {
        setComments(prevComments => [...prevComments, data]);
        setNewComment('');
        inputRef.current?.focus();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AccordionItem value="comments" className="border rounded-[4px] shadow-sm">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-emerald-500" />
          <h2 className="text-lg font-semibold text-black">Comments</h2>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-gray-500">Loading comments...</div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="border rounded-md p-3">
                <div className="text-sm text-gray-500">
                  {format(new Date(comment.created_at), 'MMM dd, yyyy hh:mm a')}
                </div>
                <div className="mt-1">{comment.comment}</div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="mt-4">
          <textarea
            ref={inputRef}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Button
            onClick={handlePostComment}
            disabled={isLoading}
            className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[4px]"
          >
            {isLoading ? "Posting..." : "Post Comment"}
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
