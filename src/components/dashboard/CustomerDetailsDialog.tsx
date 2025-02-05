
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit2, MessageSquare, Send } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface CustomerDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerData: any; // Replace with proper type when available
}

export const CustomerDetailsDialog = ({ 
  open, 
  onOpenChange,
  customerData 
}: CustomerDetailsDialogProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newNote, setNewNote] = useState("");

  const customerDetails = [
    { label: "ARN", value: "1895637456" },
    { label: "Kit No", value: "6670000033" },
    { label: "Customer Name", value: "GrupoHoteleroCubanacan" },
    { label: "PAN", value: "QDDBW1536A" },
    { label: "Total Amount Loaded (USD)", value: "6441.00" },
    { label: "Customer Type", value: "ETB" },
    { label: "Product Variant", value: "PRD8001" },
    { label: "Card Type", value: "Perso" },
    { label: "Processing Type", value: "Online" },
    { label: "ITR Flag", value: "tue" },
    { label: "LRS Amount Consumed(USD)", value: "2345" },
    { label: "Decision", value: "Approve" }
  ];

  const conversations = [
    {
      text: "Send to Maker reason: testing reason",
      timestamp: "05 February 2025, 11:50 AM",
      author: "checker"
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Application Details</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="documents" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="documents">Customer Documents</TabsTrigger>
            <TabsTrigger value="details">Customer Details</TabsTrigger>
            <TabsTrigger value="conversation">Conversation</TabsTrigger>
          </TabsList>

          <TabsContent value="documents">
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">CustomerImage</h3>
                    <p className="text-sm text-gray-500">Customer Document</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Download</Button>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details">
            <div className="grid grid-cols-2 gap-4">
              {customerDetails.map((detail, index) => (
                <div key={index} className="flex justify-between p-3 border rounded-lg">
                  <span className="text-gray-600">{detail.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{detail.value}</span>
                    {isEditing && (
                      <button onClick={() => setIsEditing(true)} className="text-gray-500 hover:text-black">
                        <Edit2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="conversation">
            <div className="space-y-4">
              <div className="space-y-4 mb-4">
                {conversations.map((conversation, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm">{conversation.text}</p>
                      </div>
                      <span className="text-xs text-gray-500 mt-1 block">
                        {conversation.author} | {conversation.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <Button size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
          <Button variant="default">Submit</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

