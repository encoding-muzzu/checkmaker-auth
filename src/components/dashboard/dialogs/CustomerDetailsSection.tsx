
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface CustomerDetailsSectionProps {
  customerDetails: {
    label: string;
    value: string | number;
  }[];
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
  const [isEditingMode, setIsEditingMode] = useState(false);
  const queryClient = useQueryClient();

  const updateApplication = async ({ id, itr_flag, lrs_amount_consumed }: { 
    id: string; 
    itr_flag: boolean; 
    lrs_amount_consumed: number; 
  }) => {
    const { error } = await supabase
      .from('applications')
      .update({ itr_flag, lrs_amount_consumed })
      .eq('id', id);
    
    if (error) throw error;
  };

  const { mutate: updateApp, isPending } = useMutation({
    mutationFn: updateApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast({
        title: "Application updated successfully!",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Update failed!",
        description: "Something went wrong. Please try again.",
      });
    },
  });

  useEffect(() => {
    setIsEditing(isEditingMode);
  }, [isEditingMode, setIsEditing]);

  const handleEditClick = () => {
    setIsEditingMode(true);
  };

  const handleCancelClick = () => {
    setIsEditingMode(false);
  };

  const handleSaveClick = async () => {
    const itr_flag = itrFlag === "true";
    const lrs_amount_consumed = parseFloat(lrsAmount);
    const applicationId = customerDetails.find(detail => detail.label === 'Application ID')?.value as string;
    updateApp({ id: applicationId, itr_flag, lrs_amount_consumed });
    setIsEditingMode(false);
  };

  return (
    <AccordionItem value="details" className="border rounded-md">
      <AccordionTrigger className="px-4">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5" />
          <span className="text-base font-medium">Customer Details</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="grid gap-4">
          {customerDetails.map((detail) => (
            <div key={detail.label} className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor={detail.label} className="text-right">
                {detail.label}
              </Label>
              <span>{detail.value}</span>
            </div>
          ))}
          <div className="grid grid-cols-2 items-center gap-4">
            <Label htmlFor="itrFlag" className="text-right">
              ITR Flag
            </Label>
            {isEditable ? (
              <Switch 
                id="itrFlag" 
                checked={itrFlag === "true"} 
                onCheckedChange={(checked) => setItrFlag(String(checked))} 
              />
            ) : (
              <span>{itrFlag === "true" ? "Yes" : "No"}</span>
            )}
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <Label htmlFor="lrsAmount" className="text-right">
              LRS Amount Consumed
            </Label>
            {isEditable ? (
              <Input
                type="number"
                id="lrsAmount"
                value={lrsAmount}
                onChange={(e) => setLrsAmount(e.target.value)}
                className="w-32"
              />
            ) : (
              <span>{lrsAmount}</span>
            )}
          </div>
          {isEditable && (
            <div className="flex justify-end space-x-2">
              <Button variant="secondary" onClick={handleCancelClick}>
                Cancel
              </Button>
              <Button onClick={handleSaveClick} disabled={isPending}>
                {isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
          {!isEditable && userRole === 'maker' && (
            <div className="flex justify-end">
              <Button onClick={handleEditClick}>Edit</Button>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
