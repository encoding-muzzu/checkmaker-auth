
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
  const [currentUser, setCurrentUser] = useState<{ email: string; role: string } | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, username')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setCurrentUser({
            email: session.user.email || '',
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
      // First get the comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('application_comments')
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      if (!commentsData || commentsData.length === 0) return [];

      // Get unique user IDs from comments
      const userIds = [...new Set(commentsData.map(comment => comment.user_id))];

      // Get user profiles for these IDs
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, role')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(profile => [profile.id, profile]) || []);

      // Get user emails from auth.users
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const userMap = new Map(users?.map(user => [user.id, user.email]) || []);

      // Combine all the data
      return commentsData.map(comment => ({
        ...comment,
        user: {
          email: userMap.get(comment.user_id) || 'Unknown User',
          role: profileMap.get(comment.user_id)?.role || 'Unknown Role'
        }
      }));
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
            <p className="text-sm">No comments available</p>
          </div>
        ) : (
          <div className="space-y-4 bg-gray-100 p-4 rounded-lg">
            {comments.map((comment: any) => {
              const isCurrentUser = currentUser?.email === comment.user?.email;
              return (
                <div 
                  key={comment.id} 
                  className={`flex flex-col max-w-[85%] ${isCurrentUser ? 'ml-auto' : 'mr-auto'} bg-white rounded-lg shadow p-3`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <span className="text-sm font-medium text-emerald-600">
                        {comment.user?.email || 'Unknown User'}
                      </span>
                      <span className="text-xs text-gray-500 ml-2 capitalize">
                        ({comment.user?.role || 'Unknown Role'})
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {format(new Date(comment.created_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{comment.comment}</p>
                  {comment.type === 'rejection' && (
                    <span className="text-xs text-red-500 mt-1">Rejection Reason</span>
                  )}
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
