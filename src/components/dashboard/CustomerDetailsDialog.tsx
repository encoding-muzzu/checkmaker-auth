
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit2, MessageSquare, Send, CheckCircle2, Clock, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [itrFlag, setItrFlag] = useState("true");
  const [lrsAmount, setLrsAmount] = useState("2345");
  const [decision, setDecision] = useState("Approve");

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

        {/* Documents Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-lg font-semibold">Customer Documents</h2>
            <Clock className="h-5 w-5 text-yellow-500" />
          </div>
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

        {/* Customer Details Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-lg font-semibold">Customer Details</h2>
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {customerDetails.map((detail, index) => (
              <div key={index} className="flex justify-between p-3 border rounded-lg">
                <span className="text-gray-600">{detail.label}</span>
                <span className="font-medium">{detail.value}</span>
              </div>
            ))}
            {/* Editable Fields */}
            <div className="flex justify-between p-3 border rounded-lg">
              <span className="text-gray-600">ITR Flag</span>
              <div className="flex items-center gap-2">
                <Input 
                  value={itrFlag}
                  onChange={(e) => setItrFlag(e.target.value)}
                  className="w-32 h-8"
                />
                <button onClick={() => setIsEditing(true)} className="text-gray-500 hover:text-black">
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex justify-between p-3 border rounded-lg">
              <span className="text-gray-600">LRS Amount Consumed(USD)</span>
              <div className="flex items-center gap-2">
                <Input 
                  value={lrsAmount}
                  onChange={(e) => setLrsAmount(e.target.value)}
                  className="w-32 h-8"
                />
                <button onClick={() => setIsEditing(true)} className="text-gray-500 hover:text-black">
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex justify-between p-3 border rounded-lg">
              <span className="text-gray-600">Decision</span>
              <div className="flex items-center gap-2">
                <Select value={decision} onValueChange={setDecision}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Approve">Approve</SelectItem>
                    <SelectItem value="Reject">Reject</SelectItem>
                  </SelectContent>
                </Select>
                <button onClick={() => setIsEditing(true)} className="text-gray-500 hover:text-black">
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Conversation Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-lg font-semibold">Conversation</h2>
            <Upload className="h-5 w-5 text-blue-500" />
          </div>
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
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
          <Button variant="default">Submit</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

