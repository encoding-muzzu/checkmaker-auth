
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MessageSquare, User } from "lucide-react";

interface Comment {
  text: string;
  timestamp: string;
  author: string;
}

interface CommentsSectionProps {
  conversations: Comment[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const CommentsSection = ({ conversations, messagesEndRef }: CommentsSectionProps) => {
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
            {conversations.map((conversation, index) => (
              <div 
                key={index} 
                className={`flex ${conversation.author === 'dinesh' ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`flex gap-3 max-w-[80%] ${conversation.author === 'muzzu' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    conversation.author === 'dinesh' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    <User className={`h-4 w-4 ${
                      conversation.author === 'dinesh' ? 'text-blue-600' : 'text-green-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className={`rounded-lg p-3 shadow-sm ${
                      conversation.author === 'dinesh' 
                        ? 'bg-white border-l-4 border-l-blue-500' 
                        : 'bg-green-50 border-r-4 border-r-green-500'
                    }`}>
                      <p className="text-sm text-gray-700">{conversation.text}</p>
                    </div>
                    <span className="text-xs text-gray-500 mt-1 block">
                      {conversation.author} | {conversation.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
