
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

      let newStatusId: number;
      let successMessage: string;

      if (profile?.role === 'maker') {
        if (selectedRow.status_id === 0 || selectedRow.status_id === 3) {
          newStatusId = 1;
          successMessage = selectedRow.status_id === 0 
            ? "Application has been approved by maker"
            : "Application has been resubmitted";
        } else {
          throw new Error("Invalid approval action for current status");
        }
      } else if (profile?.role === 'checker' && (selectedRow.status_id === 1 || selectedRow.status_id === 4)) {
        newStatusId = 2;
        successMessage = "Application has been approved by checker";
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

      if (newStatusId === 2) {
        // Call process-dbops function when checker approves
        const { error: dbopsError } = await supabase.functions.invoke('process-dbops', {
          body: {
            application_number: selectedRow.application_number,
            kit_no: selectedRow.kit_no,
            lrs_value: parseFloat(lrsAmount),
            itr_flag: itrFlag,
            old_status: selectedRow.status_id,
            new_status: newStatusId
          }
        });

        if (dbopsError) {
          throw new Error(`Failed to process application: ${dbopsError.message}`);
        }
      }

      await queryClient.invalidateQueries({ queryKey: ['applications'] });

      toast({
        title: "Success",
        description: successMessage,
        duration: 5000,
      });

      return true;
    } catch (error) {
      console.error('Error updating application:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update application",
        variant: "destructive",
        duration: 5000,
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

      let newStatusId: number;
      let successMessage: string;

      if (profile?.role === 'checker' && (selectedRow.status_id === 1 || selectedRow.status_id === 4)) {
        newStatusId = 3;
        successMessage = "Application has been returned by checker";
      } else if (profile?.role === 'maker' && (selectedRow.status_id === 0 || selectedRow.status_id === 3)) {
        newStatusId = 4;
        successMessage = "Application has been rejected by maker";
      } else {
        throw new Error("Invalid reject action for current status");
      }

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
          type: profile?.role === 'maker' ? 'rejection' : 'return',
          user_id: session.user.id
        }]);

      if (insertError) throw insertError;

      await queryClient.invalidateQueries({ queryKey: ['applications'] });
      await queryClient.invalidateQueries({ 
        queryKey: ['application-comments', selectedRow.id] 
      });

      toast({
        title: "Success",
        description: successMessage,
        duration: 5000,
      });

      return true;
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast({
        title: "Error",
        description: "Failed to process application",
        variant: "destructive",
        duration: 5000,
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
