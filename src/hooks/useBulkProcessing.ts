
import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { BulkFile, GeneratedBulkFile } from "@/types/bulkProcessing";

export const useBulkProcessing = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isExporting, setIsExporting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Debug useEffect to check mounting
  useEffect(() => {
    console.log("[useBulkProcessing] Hook initialized");
    return () => {
      console.log("[useBulkProcessing] Hook cleanup");
    };
  }, []);

  // Fetch pending bulk files
  const { data: pendingFiles, isLoading: isLoadingFiles } = useQuery({
    queryKey: ["bulk-files", "pending"],
    queryFn: async () => {
      console.log("[useBulkProcessing] Fetching pending files");
      const { data, error } = await supabase
        .from("bulk_processing_files")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[useBulkProcessing] Error fetching pending files:", error);
        toast({
          title: "Error",
          description: "Failed to fetch pending files",
          variant: "destructive",
        });
        throw error;
      }

      console.log("[useBulkProcessing] Pending files fetched:", data?.length || 0);
      return data as BulkFile[];
    },
  });

  // Fetch processed bulk files
  const { data: processedFiles, isLoading: isLoadingProcessedFiles } = useQuery({
    queryKey: ["bulk-files", "processed"],
    queryFn: async () => {
      console.log("[useBulkProcessing] Fetching processed files");
      const { data, error } = await supabase
        .from("bulk_processing_files")
        .select("*")
        .eq("status", "processed")
        .order("processed_at", { ascending: false });

      if (error) {
        console.error("[useBulkProcessing] Error fetching processed files:", error);
        toast({
          title: "Error",
          description: "Failed to fetch processed files",
          variant: "destructive",
        });
        throw error;
      }

      console.log("[useBulkProcessing] Processed files fetched:", data?.length || 0);
      return data as BulkFile[];
    },
  });

  // Fetch auto-generated files
  const { data: generatedFiles, isLoading: isLoadingGeneratedFiles, refetch: refetchGeneratedFiles } = useQuery({
    queryKey: ["bulk-files", "generated"],
    queryFn: async () => {
      console.log("[useBulkProcessing] Fetching auto-generated files");
      try {
        const { data, error } = await supabase
          .from("auto_generated_files")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("[useBulkProcessing] Error fetching auto-generated files:", error);
          toast({
            title: "Error",
            description: "Failed to fetch auto-generated files",
            variant: "destructive",
          });
          throw error;
        }

        console.log("[useBulkProcessing] Auto-generated files fetched:", data);
        console.log("[useBulkProcessing] Auto-generated files count:", data?.length || 0);
        return data as GeneratedBulkFile[];
      } catch (err) {
        console.error("[useBulkProcessing] Exception in fetching auto-generated files:", err);
        throw err;
      }
    },
  });

  // Fetch bulk processing results
  const { data: processingResults, isLoading: isLoadingResults } = useQuery({
    queryKey: ["bulk-processing-results"],
    queryFn: async () => {
      console.log("[useBulkProcessing] Fetching processing results");
      const { data, error } = await supabase
        .from("bulk_processing_results")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[useBulkProcessing] Error fetching processing results:", error);
        toast({
          title: "Error",
          description: "Failed to fetch processing results",
          variant: "destructive",
        });
        throw error;
      }

      console.log("[useBulkProcessing] Processing results fetched:", data?.length || 0);
      return data;
    },
  });

  // Export bulk data
  const exportBulkData = async () => {
    console.log("[useBulkProcessing] Starting bulk data export");
    setIsExporting(true);
    try {
      const response = await supabase.functions.invoke("export-bulk-data");
      
      console.log("[useBulkProcessing] Export function response:", response);
      
      if (response.error) {
        console.error("[useBulkProcessing] Export function error:", response.error);
        throw new Error(response.error.message);
      }
      
      if (!response.data.count) {
        console.log("[useBulkProcessing] No data to export");
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
      console.log("[useBulkProcessing] Refreshing generated files after export");
      await refetchGeneratedFiles();
      
      return response.data;
    } catch (error) {
      console.error("[useBulkProcessing] Error exporting bulk data:", error);
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
    console.log("[useBulkProcessing] Starting file upload", { fileName: file.name, makerNumber });
    setIsUploading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.error("[useBulkProcessing] No active session");
        throw new Error("You must be logged in to upload files");
      }

      const userId = sessionData.session.user.id;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("makerNumber", makerNumber.toString());
      formData.append("userId", userId);

      console.log("[useBulkProcessing] Invoking upload-bulk-file function");
      const response = await supabase.functions.invoke("upload-bulk-file", {
        body: formData,
      });

      console.log("[useBulkProcessing] Upload function response:", response);

      if (response.error) {
        console.error("[useBulkProcessing] Upload function error:", response.error);
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
      console.error("[useBulkProcessing] Error uploading file:", error);
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

  // Function to check for bulk applications
  const checkBulkApplications = useCallback(async () => {
    console.log("[useBulkProcessing] Checking for bulk applications");
    try {
      const { data, error } = await supabase
        .from("applications")
        .select("id")
        .eq("status_id", 5);
      
      if (error) {
        console.error("[useBulkProcessing] Error checking bulk applications:", error);
        return;
      }
      
      console.log(`[useBulkProcessing] Found ${data?.length || 0} applications with status_id = 5`);
      
      if (data && data.length > 0) {
        console.log("[useBulkProcessing] Applications found, triggering export");
        await exportBulkData();
      }
    } catch (err) {
      console.error("[useBulkProcessing] Exception checking bulk applications:", err);
    }
  }, []);

  // Callback for fetching generated files (to use in useEffect)
  const fetchGeneratedFiles = useCallback(async () => {
    console.log("[useBulkProcessing] Manual refetch of generated files");
    await refetchGeneratedFiles();
    await checkBulkApplications();
  }, [refetchGeneratedFiles, checkBulkApplications]);

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
