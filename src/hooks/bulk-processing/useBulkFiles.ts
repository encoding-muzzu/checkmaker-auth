
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
      return { data: filteredData, count: filteredData.length };
    },
    enabled: !!currentUserId,
  });

  return {
    bulkFiles: bulkFiles?.data || null,
    totalCount: bulkFiles?.count || 0,
    isLoading,
    refetch
  };
};
