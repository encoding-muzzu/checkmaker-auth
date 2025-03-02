
import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { BulkFile, GeneratedBulkFile } from "@/types/bulkProcessing";

export const useBulkProcessing = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isExporting, setIsExporting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch pending bulk files
  const { data: pendingFiles, isLoading: isLoadingFiles } = useQuery({
    queryKey: ["bulk-files", "pending"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bulk_processing_files")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch pending files",
          variant: "destructive",
        });
        throw error;
      }

      return data as BulkFile[];
    },
  });

  // Fetch processed bulk files
  const { data: processedFiles, isLoading: isLoadingProcessedFiles } = useQuery({
    queryKey: ["bulk-files", "processed"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bulk_processing_files")
        .select("*")
        .eq("status", "processed")
        .order("processed_at", { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch processed files",
          variant: "destructive",
        });
        throw error;
      }

      return data as BulkFile[];
    },
  });

  // Fetch auto-generated files
  const { data: generatedFiles, isLoading: isLoadingGeneratedFiles, refetch: refetchGeneratedFiles } = useQuery({
    queryKey: ["bulk-files", "generated"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("auto_generated_files")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch auto-generated files",
          variant: "destructive",
        });
        throw error;
      }

      return data as GeneratedBulkFile[];
    },
  });

  // Fetch bulk processing results
  const { data: processingResults, isLoading: isLoadingResults } = useQuery({
    queryKey: ["bulk-processing-results"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bulk_processing_results")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch processing results",
          variant: "destructive",
        });
        throw error;
      }

      return data;
    },
  });

  // Export bulk data
  const exportBulkData = async () => {
    setIsExporting(true);
    try {
      const response = await supabase.functions.invoke("export-bulk-data");
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (!response.data.count) {
        toast({
          title: "No Data",
          description: "There are no applications in bulk processing status to export.",
          duration: 5000,
        });
        return null;
      }
      
      toast({
        title: "Success",
        description: `Exported ${response.data.count} applications.`,
        duration: 5000,
      });
      
      // Refresh generated files list after export
      await refetchGeneratedFiles();
      
      return response.data;
    } catch (error) {
      console.error("Error exporting bulk data:", error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export bulk data",
        variant: "destructive",
        duration: 5000,
      });
      return null;
    } finally {
      setIsExporting(false);
    }
  };

  // Upload bulk file
  const uploadBulkFile = async (file: File, makerNumber: number) => {
    setIsUploading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("You must be logged in to upload files");
      }

      const userId = sessionData.session.user.id;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("makerNumber", makerNumber.toString());
      formData.append("userId", userId);

      const response = await supabase.functions.invoke("upload-bulk-file", {
        body: formData,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      await queryClient.invalidateQueries({ queryKey: ["bulk-files"] });
      
      toast({
        title: "Success",
        description: "File uploaded successfully",
        duration: 5000,
      });

      if (response.data.comparisonTriggered) {
        toast({
          title: "Processing Started",
          description: "Files from both makers detected. Processing started in the background.",
          duration: 5000,
        });
      }

      return response.data;
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
        duration: 5000,
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Callback for fetching generated files (to use in useEffect)
  const fetchGeneratedFiles = useCallback(async () => {
    await refetchGeneratedFiles();
  }, [refetchGeneratedFiles]);

  return {
    pendingFiles,
    processedFiles,
    generatedFiles,
    processingResults,
    isLoadingFiles,
    isLoadingProcessedFiles,
    isLoadingGeneratedFiles,
    isLoadingResults,
    isExporting,
    isUploading,
    exportBulkData,
    uploadBulkFile,
    fetchGeneratedFiles
  };
};
