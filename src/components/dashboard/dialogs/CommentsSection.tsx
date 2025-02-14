
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MessageSquare, User } from "lucide-react";
import { format } from "date-fns";

interface Comment {
  id: string;
  comment: string;
  created_at: string;
  type: 'rejection' | 'return' | 'comment';
  author?: string;
}

interface CommentsSectionProps {
  applicationId: string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const CommentsSection = ({ applicationId, messagesEndRef }: CommentsSectionProps) => {
  const { data: comments = [] } = useQuery({
    queryKey: ['application-comments', applicationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('application_comments')
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Comment[];
    },
    enabled: !!applicationId
  });

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d MMMM yyyy, h:mm a");
  };

  return (
    <AccordionItem value="notes" className="border rounded-[4px] shadow-sm">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-800">Comments</h2>
          <MessageSquare className="h-5 w-5 text-blue-500" />
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-4 bg-gray-50/50 p-6 rounded-xl">
          <div className="flex flex-col space-y-4 mb-4 h-[300px] overflow-y-auto custom-scrollbar">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No comments yet</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex justify-start">
                  <div className="flex gap-3 max-w-[80%]">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="rounded-lg p-3 shadow-sm bg-white border-l-4 border-l-blue-500">
                        <p className="text-sm text-gray-700">{comment.type === 'rejection' ? `Rejection reason: ${comment.comment}` : comment.comment}</p>
                      </div>
                      <span className="text-xs text-gray-500 mt-1 block">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
