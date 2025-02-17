
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ApplicationData } from "@/types/dashboard";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export const useApplicationActions = (selectedRow: ApplicationData | null) => {
  const [itrFlag, setItrFlag] = useState("false");
  const [lrsAmount, setLrsAmount] = useState("0");
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectMessage, setRejectMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleApprove = async () => {
    if (!selectedRow) return;
    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      // Based on the user's role and current status, determine the new status
      let newStatusId: number;
      let successMessage: string;

      if (profile?.role === 'maker') {
        if (selectedRow.status_id === 0) {
          // Maker approving a new entry
          newStatusId = 1; // Initiated By Maker
          successMessage = "Application has been initiated";
        } else if (selectedRow.status_id === 3) {
          // Maker re-submitting a rejected entry
          newStatusId = 4; // Re-opened by Maker
          successMessage = "Application has been re-submitted";
        } else {
          throw new Error("Invalid approval action for current status");
        }
      } else if (profile?.role === 'checker' && selectedRow.status_id === 1) {
        // Checker approving a maker-initiated entry
        newStatusId = 2; // Approved By Checker
        successMessage = "Application has been approved";
      } else {
        throw new Error("Invalid approval action for current status");
      }

      const { error } = await supabase
        .from('applications')
        .update({
          itr_flag: itrFlag,
          lrs_amount_consumed: parseFloat(lrsAmount),
          status_id: newStatusId
        })
        .eq('id', selectedRow.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['applications'] });

      toast({
        title: "Success",
        description: successMessage,
      });

      return true;
    } catch (error) {
      console.error('Error updating application:', error);
      toast({
        title: "Error",
        description: "Failed to update application",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRow) return;
    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      // Only checker can reject applications that are initiated by maker or re-opened
      if (profile?.role !== 'checker' || 
         (selectedRow.status_id !== 1 && selectedRow.status_id !== 4)) {
        throw new Error("Invalid reject action for current status");
      }

      const newStatusId = 3; // Rejected By Checker

      const { error: updateError } = await supabase
        .from('applications')
        .update({
          itr_flag: itrFlag,
          lrs_amount_consumed: parseFloat(lrsAmount),
          status_id: newStatusId
        })
        .eq('id', selectedRow.id);

      if (updateError) throw updateError;

      const { error: insertError } = await supabase
        .from('application_comments')
        .insert([{
          application_id: selectedRow.id,
          comment: rejectMessage,
          type: 'rejection'
        }]);

      if (insertError) throw insertError;

      await queryClient.invalidateQueries({ queryKey: ['applications'] });
      await queryClient.invalidateQueries({ 
        queryKey: ['application-comments', selectedRow.id] 
      });

      toast({
        title: "Success",
        description: "Application has been rejected",
      });

      return true;
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast({
        title: "Error",
        description: "Failed to reject application",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    itrFlag,
    setItrFlag,
    lrsAmount,
    setLrsAmount,
    isEditing,
    setIsEditing,
    isSubmitting,
    rejectMessage,
    setRejectMessage,
    handleApprove,
    handleReject
  };
};
