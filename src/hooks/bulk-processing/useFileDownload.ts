
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

      // Read the Excel data
      const arrayBuffer = await data.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      
      // Process the first sheet
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      
      // Convert sheet to JSON
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      console.log("Excel data loaded:", jsonData);
      
      // Filter JSON data to only include the required fields and errors if they exist
      const filteredData = jsonData.map((row: any) => {
        // Initialize with the four required fields
        const filteredRow: any = {
          arn: row.arn,
          pan_number: row.pan_number,
          itr_flag: row.itr_flag,
          lrs_amount_consumed: row.lrs_amount_consumed
        };
        
        // Check if there's any error information in the row and prioritize them
        if (row.Errors) {
          filteredRow.Errors = row.Errors;
        } else if (row.errors) {
          filteredRow.Errors = row.errors;
        } else if (row.Error) {
          filteredRow.Errors = row.Error;
        } else if (row.error) {
          filteredRow.Errors = row.error;
        }
        
        // Standardize error messages if they exist
        if (filteredRow.Errors) {
          const errorLower = filteredRow.Errors.toLowerCase();
          
          // Match error patterns and replace with standardized error messages
          if (errorLower.includes("arn") && errorLower.includes("not found")) {
            filteredRow.Errors = "ARN not found in original file";
          } else if (errorLower.includes("pan") && errorLower.includes("not found")) {
            filteredRow.Errors = "PAN number not found in original file";
          } else if (errorLower.includes("not found in original file")) {
            filteredRow.Errors = "Record not found in the original file";
          }
        }
        
        return filteredRow;
      });
      
      console.log("Filtered data with errors:", filteredData);
      
      // Create a new workbook with the filtered data
      const newWorkbook = XLSX.utils.book_new();
      const newSheet = XLSX.utils.json_to_sheet(filteredData);
      
      // Set column widths for better readability
      const columnWidths = [
        { wch: 15 }, // arn
        { wch: 15 }, // pan_number
        { wch: 10 }, // itr_flag
        { wch: 15 }, // lrs_amount_consumed
        { wch: 50 }  // Errors (if present)
      ];
      newSheet['!cols'] = columnWidths;
      
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
