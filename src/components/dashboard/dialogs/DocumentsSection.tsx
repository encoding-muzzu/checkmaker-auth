
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Clock, Download, Eye, FileX } from "lucide-react";

export const DocumentsSection = () => {
  // Simulate no documents for demo
  const hasDocuments = false;

  return (
    <AccordionItem value="documents" className="border rounded-[4px] shadow-sm">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-black">Customer Documents</h2>
          <Clock className="h-5 w-5 text-amber-500" />
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        {hasDocuments ? (
          <div className="p-6 border rounded-[4px] bg-gray-50/50 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-black">CustomerImage</h3>
                <p className="text-sm text-gray-500">Customer Document</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1 hover:bg-gray-100 rounded-[4px] border-black text-black"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1 hover:bg-gray-100 rounded-[4px] border-black text-black"
                >
                  <Eye className="h-4 w-4" />
                  View
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 border rounded-[4px] bg-gray-50/50">
            <FileX className="h-12 w-12 text-gray-400 mb-2" />
            <p className="text-gray-600">No documents have been uploaded yet</p>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};
