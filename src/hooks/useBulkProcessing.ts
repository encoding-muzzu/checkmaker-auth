
import { useProcessingAuth } from "./bulk-processing/useProcessingAuth";
import { useProcessingPermissions } from "./bulk-processing/useProcessingPermissions";
import { useFileOperations } from "./bulk-processing/useFileOperations";
import { useBulkPagination } from "./bulk-processing/useBulkPagination";
import { useBulkFiles } from "./bulk-processing/useBulkFiles";

export type { BulkFile } from "@/types/bulk-processing";

export const useBulkProcessing = () => {
  // Get user authentication and role information
  const { currentUserId, userRole, isMaker, isChecker } = useProcessingAuth();
  
  // Get permission and access control utilities
  const { 
    canUploadAsMaker, 
    canUploadAsChecker, 
    isCurrentUserMaker, 
    isCurrentUserChecker,
    filterFilesByRole
  } = useProcessingPermissions(currentUserId, isMaker, isChecker);
  
  // Set up pagination
  const { 
    currentPage, 
    setCurrentPage, 
    totalPages, 
    handleNextPage, 
    handlePreviousPage,
    pageSize
  } = useBulkPagination(0, 10); // We'll update the count after fetching data
  
  // Fetch bulk files with pagination
  const { 
    bulkFiles, 
    totalCount, 
    isLoading, 
    refetch 
  } = useBulkFiles(currentPage, pageSize, currentUserId, userRole, filterFilesByRole);
  
  // Set up file operations (upload, download)
  const {
    isUploading,
    uploadingFileId,
    fileInputRefs,
    handleUploadClick,
    handleFileChange,
    handleDownload
  } = useFileOperations(currentUserId, refetch);

  // Return everything needed by the components
  return {
    bulkFiles,
    totalCount,
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
    canCurrentUserUploadAsMaker: canUploadAsMaker,
    canCurrentUserUploadAsChecker: canUploadAsChecker,
    isCurrentUserMaker,
    isCurrentUserChecker,
    handleUploadClick,
    handleFileChange,
    handleDownload,
    refetch
  };
};
