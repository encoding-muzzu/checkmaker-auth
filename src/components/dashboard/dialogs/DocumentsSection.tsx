import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Files, Download, Eye } from "lucide-react";

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

  const handleViewDocument = (documentPath: string) => {
    window.open(documentPath, '_blank');
  };

  const handleDownloadDocument = (documentPath: string, documentName: string) => {
    const link = document.createElement('a');
    link.href = documentPath;
    link.download = documentName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AccordionItem value="documents" className="border rounded-[4px] shadow-sm">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <Files className="h-5 w-5 text-emerald-500" />
          <h2 className="text-lg font-semibold text-black">Customer Documents</h2>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        {hasDocuments ? (
          <ul className="space-y-2">
            {documents?.map((doc, index) => (
              <li key={index} className="flex items-center justify-between py-2 border-b">
                <span>{doc.name}</span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleViewDocument(doc.path)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownloadDocument(doc.path, doc.name)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No documents available.</p>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};
