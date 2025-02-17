
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, Edit2 } from "lucide-react";

interface CustomerDetailsSectionProps {
  customerDetails: Array<{ label: string; value: string | number }>;
  itrFlag: string;
  setItrFlag: (value: string) => void;
  lrsAmount: string;
  setLrsAmount: (value: string) => void;
  setIsEditing: (value: boolean) => void;
}

export const CustomerDetailsSection = ({
  customerDetails,
  itrFlag,
  setItrFlag,
  lrsAmount,
  setLrsAmount,
  setIsEditing
}: CustomerDetailsSectionProps) => {
  return (
    <AccordionItem value="details" className="border rounded-[4px] shadow-sm">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-black">Customer Details</h2>
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-4">
          {customerDetails.map((detail, index) => (
            <div 
              key={index} 
              className="flex justify-between p-4 border rounded-[4px] bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <span className="text-gray-600">{detail.label}</span>
              <span className="font-medium text-black">{detail.value.toString()}</span>
            </div>
          ))}
          <div className="flex justify-between p-4 border rounded-[4px] bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
            <span className="text-gray-600 my-auto">ITR Flag</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{itrFlag === "true" ? "Yes" : "No"}</span>
              <Switch 
                checked={itrFlag === "true"}
                onCheckedChange={(checked) => setItrFlag(checked ? "true" : "false")}
                className="data-[state=checked]:bg-black"
              />
            </div>
          </div>
          <div className="flex justify-between p-4 border rounded-[4px] bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
            <span className="text-gray-600 my-auto">LRS Amount Consumed(USD)</span>
            <div className="relative flex items-center">
              <Input 
                value={lrsAmount}
                onChange={(e) => setLrsAmount(e.target.value)}
                className="w-32 h-8 bg-gray-50 rounded-[4px] pr-8"
              />
              <button 
                onClick={() => setIsEditing(true)} 
                className="absolute right-2 text-black hover:text-gray-700"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
