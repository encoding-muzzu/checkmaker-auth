
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RefObject, useEffect, useState } from "react";
import { format } from "date-fns";
import { MessageSquare } from "lucide-react";

interface CommentsSectionProps {
  applicationId: string;
  messagesEndRef: RefObject<HTMLDivElement>;
}

export const CommentsSection = ({ applicationId, messagesEndRef }: CommentsSectionProps) => {
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setCurrentUser({
            id: session.user.id,
            role: profile.role
          });
        }
      }
    };

    fetchCurrentUser();
  }, []);

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['application-comments', applicationId],
    queryFn: async () => {
      const { data: commentsData, error } = await supabase
        .from('application_comments')
        .select(`
          id,
          comment,
          created_at,
          type,
          user_id,
          profiles:user_id(role)
        `)
        .eq('application_id', applicationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return commentsData?.map(comment => ({
        ...comment,
        profiles: {
          role: comment.profiles?.role || 'User'
        }
      })) || [];
    },
    enabled: !!applicationId
  });

  return (
    <AccordionItem value="comments" className="border rounded-[4px] shadow-sm">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-black">Comments</h2>
          <MessageSquare className="h-5 w-5 text-emerald-500" />
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-gray-500 bg-gray-50 rounded-lg">
            <MessageSquare className="h-8 w-8 mb-2" />
            <p className="text-sm">No comments yet</p>
          </div>
        ) : (
          <div className="space-y-4 bg-gray-100 p-4 rounded-lg">
            {comments.map((comment: any) => {
              const isCurrentUser = currentUser?.id === comment.user_id;
              const role = comment.profiles?.role || 'User';
              
              return (
                <div 
                  key={comment.id} 
                  className={`flex flex-col max-w-[85%] ${isCurrentUser ? 'ml-auto' : 'mr-auto'} bg-white rounded-lg shadow p-3`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-medium text-emerald-600 capitalize">
                      {role}
                    </span>
                    <span className="text-xs text-gray-400">
                      {format(new Date(comment.created_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.comment}</p>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};
