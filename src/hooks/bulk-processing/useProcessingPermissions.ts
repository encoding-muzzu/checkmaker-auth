
import { BulkFile } from "@/types/bulk-processing";

export const useProcessingPermissions = (
  currentUserId: string | null,
  isMaker: boolean,
  isChecker: boolean
) => {
  const canUploadAsMaker = (file: BulkFile) => {
    // Makers can upload only if:
    // 1. User has maker role
    // 2. File hasn't been processed by a maker yet
    return isMaker && !file.maker_processed;
  };

  const canUploadAsChecker = (file: BulkFile) => {
    // Checkers can upload only if:
    // 1. User has checker role
    // 2. File has been processed by a maker
    // 3. File hasn't been processed by a checker yet
    return isChecker && file.maker_processed && !file.checker_processed;
  };

  const isCurrentUserMaker = (file: BulkFile) => {
    return file.maker_user_id === currentUserId;
  };

  const isCurrentUserChecker = (file: BulkFile) => {
    return file.checker_user_id === currentUserId;
  };

  const filterFilesByRole = (files: BulkFile[], isMaker: boolean, isChecker: boolean, currentUserId: string | null) => {
    if (isMaker) {
      // Makers can see:
      // 1. Original files (no one has processed yet)
      // 2. Files they've processed as maker
      // 3. Files that are ready for maker processing
      return files.filter(file => {
        const isOriginalFile = !file.maker_processed && !file.checker_processed;
        const isOwnProcessedFile = file.maker_user_id === currentUserId;
        const isReadyForMakerProcessing = !file.maker_processed;
        
        return isOriginalFile || isOwnProcessedFile || isReadyForMakerProcessing;
      });
    } 
    else if (isChecker) {
      // Checkers can see:
      // 1. Files that have been processed by makers and are ready for checker processing
      // 2. Files they've processed as checker
      return files.filter(file => {
        const isReadyForCheckerProcessing = file.maker_processed && !file.checker_processed;
        const isOwnProcessedFile = file.checker_user_id === currentUserId;
        
        return isReadyForCheckerProcessing || isOwnProcessedFile;
      });
    }
    
    // If not maker or checker, return all files
    return files;
  };

  return {
    canUploadAsMaker,
    canUploadAsChecker,
    isCurrentUserMaker,
    isCurrentUserChecker,
    filterFilesByRole
  };
};
