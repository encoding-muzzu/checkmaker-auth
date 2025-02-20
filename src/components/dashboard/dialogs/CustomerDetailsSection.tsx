import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEffect, useState } from "react";

interface CustomerDetailsSectionProps {
  customerDetails: { label: string; value: string | number }[];
  itrFlag: string;
  setItrFlag: (value: string) => void;
  lrsAmount: string;
  setLrsAmount: (value: string) => void;
  setIsEditing: (value: boolean) => void;
  userRole: string | null;
  isEditable: boolean;
}

export const CustomerDetailsSection = ({ 
  customerDetails,
  itrFlag,
  setItrFlag,
  lrsAmount,
  setLrsAmount,
  setIsEditing,
  userRole,
  isEditable
}: CustomerDetailsSectionProps) => {
  return (
    <AccordionItem value="details" className="border rounded-[4px] shadow-sm">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-emerald-500" />
          <h2 className="text-lg font-semibold text-black">Customer Details</h2>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {customerDetails.map((detail, index) => (
            <div key={index}>
              <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
                {detail.label}
              </Label>
              <Input
                type="text"
                value={detail.value?.toString() || ''}
                className="col-span-3 mt-2"
                readOnly
              />
            </div>
          ))}
          <div>
            <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
              ITR Flag
            </Label>
            <RadioGroup defaultValue={itrFlag} className="flex flex-row space-x-2 mt-2" onValueChange={(value) => {
              if (isEditable) {
                setItrFlag(value);
                setIsEditing(true);
              }
            }}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="itr-yes" disabled={!isEditable} />
                <Label htmlFor="itr-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="itr-no" disabled={!isEditable} />
                <Label htmlFor="itr-no">No</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
              LRS Amount Consumed
            </Label>
            <Input
              type="text"
              value={lrsAmount}
              className="col-span-3 mt-2"
              onChange={(e) => {
                if (isEditable) {
                  setLrsAmount(e.target.value);
                  setIsEditing(true);
                }
              }}
              readOnly={!isEditable}
            />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
