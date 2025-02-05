
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit2, MessageSquare, Send, CheckCircle2, Clock, Upload, Download, Eye, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { format } from "date-fns";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface CustomerDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerData: any;
}

export const CustomerDetailsDialog = ({ 
  open, 
  onOpenChange,
  customerData 
}: CustomerDetailsDialogProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [itrFlag, setItrFlag] = useState("true");
  const [lrsAmount, setLrsAmount] = useState("2345");
  const [decision, setDecision] = useState("Approve");
  const [conversations, setConversations] = useState([
    {
      text: "asdfasdf",
      timestamp: "05 February 2025, 1:28 PM",
      author: "checker"
    },
    {
      text: "Return reason: To validate photo again",
      timestamp: "31 January 2025, 2:17 PM",
      author: "checker"
    },
    {
      text: "Return by checker",
      timestamp: "31 January 2025, 2:17 PM",
      author: "checker"
    },
    {
      text: "Reject for photo",
      timestamp: "31 January 2025, 2:16 PM",
      author: "maker"
    }
  ]);

  const customerDetails = [
    { label: "ARN", value: "1895637456" },
    { label: "Kit No", value: "6670000033" },
    { label: "Customer Name", value: "GrupoHoteleroCubanacan" },
    { label: "PAN", value: "QDDBW1536A" },
    { label: "Total Amount Loaded (USD)", value: "6441.00" },
    { label: "Customer Type", value: "ETB" },
    { label: "Product Variant", value: "PRD8001" },
    { label: "Card Type", value: "Perso" },
    { label: "Processing Type", value: "Online" }
  ];

  const handleSubmitMessage = () => {
    if (newNote.trim()) {
      const newMessage = {
        text: newNote,
        timestamp: format(new Date(), "dd MMMM yyyy, h:mm a"),
        author: "maker" // Changed to maker since user is logged in as maker
      };
      setConversations(prev => [...prev, newMessage]); // Changed to append at the end
      setNewNote("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmitMessage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Application Details
          </DialogTitle>
        </DialogHeader>

        <Accordion type="multiple" defaultValue={["documents", "details", "notes"]} className="space-y-4">
          {/* Documents Section */}
          <AccordionItem value="documents" className="border rounded-lg shadow-sm">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-800">Customer Documents</h2>
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="p-6 border rounded-xl bg-gray-50/50 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-700">CustomerImage</h3>
                    <p className="text-sm text-gray-500">Customer Document</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-1 hover:bg-gray-100"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-1 hover:bg-gray-100"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Customer Details Section */}
          <AccordionItem value="details" className="border rounded-lg shadow-sm">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-800">Customer Details</h2>
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="grid grid-cols-2 gap-4">
                {customerDetails.map((detail, index) => (
                  <div 
                    key={index} 
                    className="flex justify-between p-4 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <span className="text-gray-600">{detail.label}</span>
                    <span className="font-medium text-gray-900">{detail.value}</span>
                  </div>
                ))}
                {/* Editable Fields */}
                <div className="flex justify-between p-4 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                  <span className="text-gray-600">ITR Flag</span>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={itrFlag}
                      onChange={(e) => setItrFlag(e.target.value)}
                      className="w-32 h-8 bg-gray-50"
                    />
                    <button onClick={() => setIsEditing(true)} className="text-blue-600 hover:text-blue-800">
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between p-4 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                  <span className="text-gray-600">LRS Amount Consumed(USD)</span>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={lrsAmount}
                      onChange={(e) => setLrsAmount(e.target.value)}
                      className="w-32 h-8 bg-gray-50"
                    />
                    <button onClick={() => setIsEditing(true)} className="text-blue-600 hover:text-blue-800">
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between p-4 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                  <span className="text-gray-600">Decision</span>
                  <div className="flex items-center gap-2">
                    <Select value={decision} onValueChange={setDecision}>
                      <SelectTrigger className="w-32 bg-gray-50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Approve">Approve</SelectItem>
                        <SelectItem value="Reject">Reject</SelectItem>
                      </SelectContent>
                    </Select>
                    <button onClick={() => setIsEditing(true)} className="text-blue-600 hover:text-blue-800">
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Notes Section */}
          <AccordionItem value="notes" className="border rounded-lg shadow-sm">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-800">Notes</h2>
                <MessageSquare className="h-5 w-5 text-blue-500" />
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4 bg-gray-50/50 p-6 rounded-xl">
                {/* Added flex-col-reverse to show latest messages at bottom */}
                <div className="flex flex-col-reverse space-y-reverse space-y-4 mb-4 h-[300px] overflow-y-auto custom-scrollbar">
                  {conversations.map((conversation, index) => (
                    <div 
                      key={index} 
                      className={`flex gap-3 ${conversation.author === 'checker' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`flex gap-3 max-w-[80%] ${conversation.author === 'maker' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          conversation.author === 'checker' ? 'bg-blue-100' : 'bg-green-100'
                        }`}>
                          <User className={`h-4 w-4 ${
                            conversation.author === 'checker' ? 'text-blue-600' : 'text-green-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className={`rounded-lg p-3 shadow-sm ${
                            conversation.author === 'checker' 
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
                </div>

                <div className="flex gap-2 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                  <Input
                    placeholder="Add a note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400"
                  />
                  <Button 
                    size="icon" 
                    className="bg-blue-600 hover:bg-blue-700 rounded-full h-8 w-8"
                    onClick={handleSubmitMessage}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex justify-end gap-2 mt-8 pt-4 border-t">
          <Button 
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="hover:bg-gray-100"
          >
            Close
          </Button>
          <Button 
            variant="default"
            className="bg-blue-600 hover:bg-blue-700"
          >
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
