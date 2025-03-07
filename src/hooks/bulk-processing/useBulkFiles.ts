
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
      
      // First, get the total count of records
      const { count: totalCount, error: countError } = await supabase
        .from("bulk_file_processing")
        .select("*", { count: 'exact', head: true });
      
      if (countError) throw countError;
      
      // Then get the paginated data
      let query = supabase
        .from("bulk_file_processing")
        .select("*")
        .order('created_at', { ascending: true })
        .range(from, to);
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      const transformedData = data as BulkFile[];
      
      // Apply role-based filtering
      const filteredData = filterFilesByRole(transformedData, isMaker, isChecker, currentUserId);
      
      return { 
        data: filteredData, 
        count: totalCount
      };
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
