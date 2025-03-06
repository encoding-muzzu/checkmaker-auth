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
      
      // Filter files based on user role
      if (isMaker) {
        // Makers can only see original files and files uploaded by makers
        const { data, error, count } = await query;
        
        if (error) throw error;
        
        // Filter files for makers: show only original files and maker-uploaded files
        const filteredData = data.filter(file => {
          // Show all files that don't have a maker2_user_id (no checker upload)
          return file.maker2_user_id === null;
        });
        
        return { data: filteredData as BulkFile[], count: filteredData.length };
      } else if (isChecker) {
        // Checkers can only see original files and files uploaded by checkers
        const { data, error, count } = await query;
        
        if (error) throw error;
        
        // Filter files for checkers: show only original files and checker-uploaded files
        const filteredData = data.filter(file => {
          // Show all files that don't have a maker1_user_id (no maker upload)
          // or files that have maker1_processed = true (ready for checker)
          return file.maker1_user_id === null || file.maker1_processed === true;
        });
        
        return { data: filteredData as BulkFile[], count: filteredData.length };
      } else {
        // For other roles or unauthenticated users
        const { data, error, count } = await query;
        if (error) throw error;
        return { data: data as BulkFile[], count: count || 0 };
      }
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
    // Implement new logic: Makers can upload only if no maker has uploaded yet
    return isMaker && !file.maker1_processed && file.maker1_user_id === null;
  };

  const canCurrentUserUploadAsMaker2 = (file: BulkFile) => {
    // Implement new logic: Checkers can upload only if maker has processed but no checker has uploaded yet
    return isChecker && 
      file.maker1_processed && 
      !file.maker2_processed && 
      file.maker2_user_id === null;
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
        .from('bulk-files')  // Fixed bucket name from 'bulk_processing' to 'bulk-files'
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
          [`maker${makerType.slice(-1)}_processed`]: true,
          [`maker${makerType.slice(-1)}_processed_at`]: new Date().toISOString(),
          [`maker${makerType.slice(-1)}_user_id`]: currentUserId,
          status: makerType === 'maker1' ? 'maker1_processed' : 'maker2_processed'
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
        .from('bulk-files')  // Fixed bucket name from 'bulk_processing' to 'bulk-files'
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
