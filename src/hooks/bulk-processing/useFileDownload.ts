
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { sonnerToast } from "@/utils/toast-utils";

export interface UseFileDownloadResult {
  handleDownload: (filePath: string) => Promise<void>;
}

export const useFileDownload = (): UseFileDownloadResult => {
  const { toast } = useToast();

  const handleDownload = async (filePath: string) => {
    try {
      console.log("Downloading file:", filePath);
      
      const { data, error } = await supabase.storage
        .from('bulk-files')
        .download(filePath);

      if (error) {
        console.error("Storage download error:", error);
        throw error;
      }

      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath.split('/').pop() || 'downloaded_file.xlsx';
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
    handleDownload
  };
};
