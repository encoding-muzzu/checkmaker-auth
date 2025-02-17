
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

      const newStatusId = profile?.role === 'checker' ? 2 : 1;

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
        description: "Application has been approved",
      });

      return true;
    } catch (error) {
      console.error('Error updating application:', error);
      toast({
        title: "Error",
        description: "Failed to approve application",
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

      const newStatusId = profile?.role === 'checker' ? 4 : 3;

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
