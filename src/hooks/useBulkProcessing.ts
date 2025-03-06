
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { toast as sonnerToast } from "sonner";

export interface BulkFile {
  id: string;
  file_name: string;
  file_path: string;
  created_at: string;
  status: string;
  record_count: number | null;
  maker1_processed: boolean;
  maker1_processed_at: string | null;
  maker1_user_id: string | null;
  maker2_processed: boolean;
  maker2_processed_at: string | null;
  maker2_user_id: string | null;
}

export const useBulkProcessing = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFileId, setUploadingFileId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const { toast } = useToast();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const currentUserId = session?.user?.id || null;

  const { data: userProfile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      if (!currentUserId) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", currentUserId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!currentUserId,
  });

  const userRole = userProfile?.role || null;
  const isMaker = userRole === 'maker';
  const isChecker = userRole === 'checker';

  console.log("Current user role:", userRole);

  const { data: bulkFiles, isLoading, refetch } = useQuery({
    queryKey: ["bulk-files", currentPage, userRole],
    queryFn: async () => {
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      
      let query = supabase
        .from("bulk_file_processing")
        .select("*", { count: 'exact' })
        .order("created_at", { ascending: false })
        .range(from, to);
      
      // Get all files first, then filter on client side based on role
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      let filteredData = data as BulkFile[];
      
      // Filter files based on user role
      if (isMaker) {
        console.log("Filtering files for maker role");
        // Makers can see:
        // 1. Original files (no one has processed yet)
        // 2. Files they've processed as maker
        // 3. Files that are ready for maker processing
        filteredData = data.filter(file => {
          const isOriginalFile = !file.maker1_processed && !file.maker2_processed;
          const isOwnProcessedFile = file.maker1_user_id === currentUserId;
          const isReadyForMakerProcessing = !file.maker1_processed;
          
          return isOriginalFile || isOwnProcessedFile || isReadyForMakerProcessing;
        });
      } 
      else if (isChecker) {
        console.log("Filtering files for checker role");
        // Checkers can see:
        // 1. Files that have been processed by makers and are ready for checker processing
        // 2. Files they've processed as checker
        filteredData = data.filter(file => {
          const isReadyForCheckerProcessing = file.maker1_processed && !file.maker2_processed;
          const isOwnProcessedFile = file.maker2_user_id === currentUserId;
          
          return isReadyForCheckerProcessing || isOwnProcessedFile;
        });
      }
      
      console.log(`Role: ${userRole}, Filtered files count: ${filteredData.length}, Original count: ${data.length}`);
      return { data: filteredData, count: filteredData.length };
    },
    enabled: !!session,
  });

  // Calculate total pages
  const totalPages = Math.ceil((bulkFiles?.count || 0) / pageSize);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const canCurrentUserUploadAsMaker1 = (file: BulkFile) => {
    // Makers can upload only if:
    // 1. User has maker role
    // 2. File hasn't been processed by a maker yet
    return isMaker && !file.maker1_processed;
  };

  const canCurrentUserUploadAsMaker2 = (file: BulkFile) => {
    // Checkers can upload only if:
    // 1. User has checker role
    // 2. File has been processed by a maker
    // 3. File hasn't been processed by a checker yet
    return isChecker && file.maker1_processed && !file.maker2_processed;
  };

  const isCurrentUserMaker1 = (file: BulkFile) => {
    return file.maker1_user_id === currentUserId;
  };

  const isCurrentUserMaker2 = (file: BulkFile) => {
    return file.maker2_user_id === currentUserId;
  };

  const handleUploadClick = (fileId: string, inputRef: React.RefObject<HTMLInputElement>) => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fileId: string, makerType: string) => {
    const file = e.target.files?.[0];

    if (!file) {
      toast({
        title: "Error",
        description: "No file selected.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadingFileId(fileId);

    try {
      const filePath = `bulk_uploads/${fileId}/${makerType}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('bulk-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      const { error: dbError } = await supabase
        .from('bulk_file_processing')
        .update({
          file_path: filePath,
          [`${makerType}_processed`]: true,
          [`${makerType}_processed_at`]: new Date().toISOString(),
          [`${makerType}_user_id`]: currentUserId,
          status: makerType === 'maker1' 
            ? 'maker1_processed' 
            : (file.maker1_processed ? 'bulk_processed_successfully' : 'maker2_processed')
        })
        .eq('id', fileId);

      if (dbError) {
        throw dbError;
      }

      sonnerToast.success(`File uploaded successfully as ${makerType === 'maker1' ? 'Maker' : 'Checker'}!`);
      refetch();
    } catch (error: any) {
      console.error("File upload error:", error);
      toast({
        title: "Error",
        description: `Failed to upload file: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadingFileId(null);
    }
  };

  const handleDownload = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('bulk-files')
        .download(filePath);

      if (error) {
        throw error;
      }

      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath.split('/').pop() || 'downloaded_file'; // Extract filename
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      sonnerToast.success("File downloaded successfully!");
    } catch (error: any) {
      console.error("File download error:", error);
      toast({
        title: "Error",
        description: `Failed to download file: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return {
    bulkFiles: bulkFiles?.data || null,
    totalCount: bulkFiles?.count || 0,
    totalPages,
    currentPage,
    setCurrentPage,
    handleNextPage,
    handlePreviousPage,
    isLoading,
    currentUserId,
    userRole,
    isUploading,
    uploadingFileId,
    fileInputRefs,
    canCurrentUserUploadAsMaker1,
    canCurrentUserUploadAsMaker2,
    isCurrentUserMaker1,
    isCurrentUserMaker2,
    handleUploadClick,
    handleFileChange,
    handleDownload,
    refetch
  };
};
