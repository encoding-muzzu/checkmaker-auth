
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BulkFile } from "@/types/bulk-processing";

export const useBulkFiles = (
  currentPage: number, 
  pageSize: number, 
  currentUserId: string | null,
  userRole: string | null,
  filterFilesByRole: (files: BulkFile[], isMaker: boolean, isChecker: boolean, currentUserId: string | null) => BulkFile[]
) => {
  const isMaker = userRole === 'maker';
  const isChecker = userRole === 'checker';

  const { data: bulkFiles, isLoading, refetch } = useQuery({
    queryKey: ["bulk-files", currentPage, userRole],
    queryFn: async () => {
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      
      // First, get total count of all bulk files (before role filtering)
      const { count: totalCountResult } = await supabase
        .from("bulk_file_processing")
        .select("*", { count: 'exact', head: true });
      
      // Then get the actual data with pagination
      let query = supabase
        .from("bulk_file_processing")
        .select("*", { count: 'exact' })
        .order('created_at', { ascending: true }) // Changed to ascending
        .range(from, to);
      
      // Get all files first, then filter on client side based on role
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      const transformedData = data as BulkFile[];
      
      // Apply role-based filtering
      const filteredData = filterFilesByRole(transformedData, isMaker, isChecker, currentUserId);
      
      console.log(`Role: ${userRole}, Filtered files count: ${filteredData.length}, Original count: ${data.length}`);
      
      // Get the total count of files after filtering (for pagination)
      // We'll fetch all records to get an accurate count after filtering
      const { data: allData } = await supabase
        .from("bulk_file_processing")
        .select("*");
        
      const allFilteredData = filterFilesByRole(allData as BulkFile[], isMaker, isChecker, currentUserId);
      
      return { 
        data: filteredData, 
        count: allFilteredData.length,
        totalCount: totalCountResult
      };
    },
    enabled: !!currentUserId,
  });

  return {
    bulkFiles: bulkFiles?.data || null,
    totalCount: bulkFiles?.count || 0,
    allFilesCount: bulkFiles?.totalCount || 0,
    isLoading,
    refetch
  };
};
