
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface BulkFile {
  id: string;
  file_name: string;
  file_path: string;
  created_at: string;
  maker1_processed: boolean;
  maker1_processed_at: string | null;
  maker1_user_id: string | null;
  maker2_processed: boolean;
  maker2_processed_at: string | null;
  maker2_user_id: string | null;
  status: string;
  record_count: number | null;
}

export const useBulkProcessing = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<BulkFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch user role
  useEffect(() => {
    const fetchUserRole = async () => {
      console.log("Fetching user role...");
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log("No session found");
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error("Error fetching user profile:", error);
          toast({
            title: "Error",
            description: "Failed to fetch user profile",
            variant: "destructive",
          });
          return;
        }

        console.log("User role:", profile.role);
        setUserRole(profile.role);
      } catch (error) {
        console.error("Error in fetchUserRole:", error);
        toast({
          title: "Error",
          description: "Failed to fetch user role",
          variant: "destructive",
        });
      }
    };

    fetchUserRole();
  }, [toast]);

  // Fetch bulk files
  const {
    data: bulkFiles,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["bulk-files"],
    queryFn: async () => {
      console.log("Fetching bulk files...");
      const { data, error } = await supabase
        .from("bulk_file_processing")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching bulk files:", error);
        throw new Error(error.message);
      }

      console.log("Fetched bulk files:", data);
      return data as BulkFile[];
    }
  });

  // Download file function
  const downloadFile = async (filePath: string) => {
    console.log("Downloading file:", filePath);
    try {
      const { data, error } = await supabase.storage
        .from("bulk-files")
        .download(filePath);

      if (error) {
        console.error("Error downloading file:", error);
        toast({
          title: "Error",
          description: "Failed to download file",
          variant: "destructive",
        });
        return;
      }

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = filePath.split("/").pop() || "download.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log("File downloaded successfully");
      toast({
        title: "Success",
        description: "File downloaded successfully",
      });
    } catch (error) {
      console.error("Error in downloadFile:", error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  // Upload file mutation
  const uploadMutation = useMutation({
    mutationFn: async ({
      file,
      fileId,
      makerType
    }: {
      file: File;
      fileId: string;
      makerType: string;
    }) => {
      console.log(`Uploading file for ${makerType}, fileId: ${fileId}`);
      setIsUploading(true);
      
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("fileId", fileId);
        formData.append("makerType", makerType);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("No active session");
        }

        // Send the auth token along with the request
        const response = await supabase.functions.invoke("process-bulk-data", {
          body: formData,
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });

        if (response.error) {
          console.error("Error processing bulk data:", response.error);
          throw new Error(response.error.message);
        }

        console.log("File processed successfully:", response.data);
        return response.data;
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: () => {
      console.log("Upload successful, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["bulk-files"] });
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    },
    onError: (error) => {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    }
  });

  // Upload file function
  const uploadFile = async (file: File, fileId: string, makerType: string) => {
    console.log(`Uploading file for ${makerType}, fileId: ${fileId}`);
    await uploadMutation.mutateAsync({ file, fileId, makerType });
  };

  // Refresh data
  const refreshData = () => {
    console.log("Refreshing bulk files data");
    refetch();
  };

  // Check if user can upload as maker1
  const canUploadAsMaker1 = (file: BulkFile) => {
    return userRole === "maker" && !file.maker1_processed;
  };

  // Check if user can upload as maker2
  const canUploadAsMaker2 = (file: BulkFile) => {
    return userRole === "maker" && file.maker1_processed && !file.maker2_processed;
  };

  return {
    bulkFiles,
    isLoading,
    error,
    userRole,
    selectedFile,
    setSelectedFile,
    downloadFile,
    uploadFile,
    refreshData,
    isUploading,
    canUploadAsMaker1,
    canUploadAsMaker2
  };
};
