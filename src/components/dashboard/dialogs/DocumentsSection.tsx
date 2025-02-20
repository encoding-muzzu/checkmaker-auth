import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Files } from "lucide-react";

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
    <AccordionItem value="documents" className="border rounded-md">
      <AccordionTrigger className="px-4">
        <div className="flex items-center gap-2">
          <Files className="h-5 w-5" />
          <span className="text-base font-medium">Documents</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        {hasDocuments ? (
          <ul className="space-y-2">
            {documents.map((doc, index) => (
              <li key={index} className="flex items-center justify-between">
                <span>{doc.name}</span>
                <div className="space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleViewDocument(doc.path)}>
                    View
                  </Button>
                  <Button size="sm" onClick={() => handleDownloadDocument(doc.path, doc.name)}>
                    Download
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
