
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Files, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface Document {
  name: string;
  path: string;
  type: string;
}

interface DocumentsSectionProps {
  documents?: Document[] | null;
  onDocumentView: (documentPath: string) => void;
  viewedDocuments: Set<string>;
}

export const DocumentsSection = ({ documents, onDocumentView, viewedDocuments }: DocumentsSectionProps) => {
  const hasDocuments = documents && documents.length > 0;
  const [documentUrls, setDocumentUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!hasDocuments) return;
    
    const fetchDocumentUrls = async () => {
      const urls: Record<string, string> = {};
      
      for (const doc of documents!) {
        try {
          const { data } = await supabase.storage
            .from('customer_documents')
            .createSignedUrl(doc.path, 3600); // 1 hour expiry
            
          if (data?.signedUrl) {
            urls[doc.path] = data.signedUrl;
            // Mark document as viewed when loaded
            onDocumentView(doc.path);
          }
        } catch (error) {
          console.error('Error creating signed URL for document:', error);
        }
      }
      
      setDocumentUrls(urls);
    };
    
    fetchDocumentUrls();
  }, [documents, hasDocuments, onDocumentView]);

  return (
    <AccordionItem value="documents" className="border rounded-[4px] shadow-sm">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-black">Customer Documents</h2>
          <Files className="h-5 w-5 text-emerald-500" />
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        {hasDocuments ? (
          <div className="space-y-4">
            {documents!.map((doc, index) => (
              <div key={index} className="p-4 border rounded-[4px] bg-gray-50/50 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div>
                  <h3 className="font-semibold text-black mb-2">{doc.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">Customer Document</p>
                  {documentUrls[doc.path] ? (
                    <div className="mt-2 rounded-lg overflow-hidden border border-gray-200">
                      <img 
                        src={documentUrls[doc.path]} 
                        alt={doc.name} 
                        className="w-full max-h-96 object-contain bg-white" 
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
                      <div className="flex flex-col items-center">
                        <Image className="h-12 w-12 text-gray-400" />
                        <p className="text-gray-500 mt-2">Loading document...</p>
                      </div>
                    </div>
                  )}
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
