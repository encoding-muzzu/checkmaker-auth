import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
  return (
    <AccordionItem value="documents" className="border rounded-[4px] shadow-sm">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-black">Documents</h2>
          <Files className="h-5 w-5 text-emerald-500" />
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        {!documents || documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-gray-500 bg-gray-50 rounded-lg">
            <Files className="h-8 w-8 mb-2" />
            <p className="text-sm">No documents available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {documents.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <span className="text-sm font-medium text-gray-700">{doc.name}</span>
                <div className="flex items-center gap-2">
                  <a
                    href={doc.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-emerald-600 hover:text-emerald-700"
                  >
                    View
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};
