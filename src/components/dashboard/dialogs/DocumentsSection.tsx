import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Files, Download, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Document {
  name: string;
  path: string;
  type: string;
}

interface DocumentsSectionProps {
  documents?: Document[];
}

export const DocumentsSection = ({ documents }: DocumentsSectionProps) => {
  const hasDocuments = documents && documents.length > 0;

  const handleViewDocument = async (doc: Document) => {
    try {
      const { data } = await supabase.storage
        .from('customer_documents')
        .createSignedUrl(doc.path, 60);

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error) {
      console.error('Error viewing document:', error);
    }
  };

  const handleDownloadDocument = async (doc: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('customer_documents')
        .download(doc.path);

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = doc.name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  return (
    <AccordionItem value="documents" className="border rounded-[4px] shadow-sm">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-black">Documents</h2>
          <Files className="h-5 w-5 text-emerald-500" />
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        {hasDocuments ? (
          <div className="space-y-4">
            {documents.map((doc, index) => (
              <div key={index} className="p-6 border rounded-[4px] bg-gray-50/50 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-black">{doc.name}</h3>
                    <p className="text-sm text-gray-500">Customer Document</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-1 hover:bg-gray-100 rounded-[4px] border-black text-black"
                      onClick={() => handleDownloadDocument(doc)}
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-1 hover:bg-gray-100 rounded-[4px] border-black text-black"
                      onClick={() => handleViewDocument(doc)}
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 border rounded-[4px] bg-gray-50/50">
            <Files className="h-12 w-12 text-gray-400 mb-2" />
            <p className="text-gray-600">No documents have been uploaded yet</p>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};
