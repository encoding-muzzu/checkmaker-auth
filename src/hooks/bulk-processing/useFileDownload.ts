
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { sonnerToast } from "@/utils/toast-utils";
import * as XLSX from "xlsx";

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

      // Filter the Excel data to only include the required fields
      const arrayBuffer = await data.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      
      // Process the first sheet
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      
      // Convert sheet to JSON
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      
      // Filter JSON data to only include the required fields
      const filteredData = jsonData.map((row: any) => ({
        arn: row.arn,
        pan_number: row.pan_number,
        itr_flag: row.itr_flag,
        lrs_amount_consumed: row.lrs_amount_consumed
      }));
      
      // Create a new workbook with the filtered data
      const newWorkbook = XLSX.utils.book_new();
      const newSheet = XLSX.utils.json_to_sheet(filteredData);
      XLSX.utils.book_append_sheet(newWorkbook, newSheet, "Applications");
      
      // Generate and download the new Excel file
      const excelBuffer = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      
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
