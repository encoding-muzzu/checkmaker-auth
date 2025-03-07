
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
  
  // Fetch bulk files with pagination (initially with 0 count)
  const { 
    bulkFiles, 
    totalCount, 
    isLoading, 
    refetch 
  } = useBulkFiles(1, 10, currentUserId, userRole, filterFilesByRole);
  
  // Set up pagination with the actual total count
  const { 
    currentPage, 
    setCurrentPage, 
    totalPages, 
    handleNextPage, 
    handlePreviousPage,
    pageSize
  } = useBulkPagination(totalCount, 10);
  
  // Refetch with the current page once pagination is set up
  const { 
    bulkFiles: paginatedBulkFiles, 
    totalCount: paginatedTotalCount, 
    isLoading: isPaginatedLoading, 
    refetch: refetchPaginated 
  } = useBulkFiles(currentPage, pageSize, currentUserId, userRole, filterFilesByRole);
  
  // Set up file operations (upload, download)
  const {
    isUploading,
    uploadingFileId,
    fileInputRefs,
    handleUploadClick,
    handleFileChange,
    handleDownload
  } = useFileOperations(currentUserId, refetchPaginated);

  // Return everything needed by the components
  return {
    bulkFiles: paginatedBulkFiles,
    totalCount: paginatedTotalCount,
    totalPages,
    currentPage,
    setCurrentPage,
    handleNextPage,
    handlePreviousPage,
    isLoading: isPaginatedLoading,
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
    refetch: refetchPaginated
  };
};
