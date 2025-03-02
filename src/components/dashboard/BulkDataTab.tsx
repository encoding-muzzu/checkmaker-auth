import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useBulkProcessing } from "@/hooks/useBulkProcessing";
import { UploadCloud, FileSpreadsheet, Download } from "lucide-react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const BulkDataTab = () => {
  const { 
    pendingFiles, 
    processedFiles, 
    generatedFiles,
    isLoadingFiles, 
    isExporting, 
    isUploading, 
    exportBulkData, 
    uploadBulkFile,
    fetchGeneratedFiles 
  } = useBulkProcessing();
  
  const [fileUpload, setFileUpload] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("export");
  const { data: { session } } = useAuth();
  const [makerNumber, setMakerNumber] = useState<number>(1);

  useEffect(() => {
    fetchGeneratedFiles();
    
    const interval = setInterval(() => {
      fetchGeneratedFiles();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchGeneratedFiles]);

  const handleExport = async () => {
    const exportData = await exportBulkData();
    if (exportData) {
      const byteCharacters = atob(exportData.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = exportData.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileUpload(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (fileUpload) {
      await uploadBulkFile(fileUpload, makerNumber);
      setFileUpload(null);
    }
  };

  const downloadGeneratedFile = async (filePath: string, fileName: string) => {
    try {
      const response = await fetch(`https://dhgseybgaswdryynnomz.supabase.co/storage/v1/object/public/bulk-files/${filePath}`);
      
      if (!response.ok) {
        throw new Error(`Error downloading file: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="export">Export Bulk Data</TabsTrigger>
          <TabsTrigger value="upload">Upload Processed Data</TabsTrigger>
        </TabsList>
        
        <TabsContent value="export" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Export Applications for Bulk Processing</h3>
              <p className="text-sm text-gray-500">
                Export all applications that are currently in the bulk processing status.
                The exported file can be processed offline and then uploaded back for further processing.
              </p>
              
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center gap-2 bg-black text-white"
              >
                {isExporting ? "Exporting..." : "Export to Excel"}
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Auto-Generated Files</h3>
            {isLoadingFiles ? (
              <p>Loading files...</p>
            ) : !generatedFiles || generatedFiles.length === 0 ? (
              <p className="text-sm text-gray-500">No auto-generated files found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[0.8125rem] text-[rgba(0,0,0,0.87)] font-medium">File Name</TableHead>
                    <TableHead className="text-[0.8125rem] text-[rgba(0,0,0,0.87)] font-medium">Generated At</TableHead>
                    <TableHead className="text-[0.8125rem] text-[rgba(0,0,0,0.87)] font-medium">Records</TableHead>
                    <TableHead className="text-[0.8125rem] text-[rgba(0,0,0,0.87)] font-medium">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {generatedFiles.map((file) => (
                    <TableRow key={file.id} className="border-b border-[rgb(224,224,224)]">
                      <TableCell className="text-[0.8125rem] leading-[1.43] text-[rgba(0,0,0,0.87)]">{file.file_name}</TableCell>
                      <TableCell className="text-[0.8125rem] leading-[1.43] text-[rgba(0,0,0,0.87)]">
                        {format(new Date(file.created_at), "MMM d, yyyy, h:mm a")}
                      </TableCell>
                      <TableCell className="text-[0.8125rem] leading-[1.43] text-[rgba(0,0,0,0.87)]">
                        {file.record_count || "N/A"}
                      </TableCell>
                      <TableCell className="text-[0.8125rem] leading-[1.43] text-[rgba(0,0,0,0.87)]">
                        <Button
                          onClick={() => downloadGeneratedFile(file.file_path, file.file_name)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Download className="h-3 w-3" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="upload" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Upload Processed Excel File</h3>
              <p className="text-sm text-gray-500">
                Upload the Excel file after you've made your changes.
                Once both Maker 1 and Maker 2 have uploaded their files, they will be automatically compared.
              </p>
              
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-4">
                  <input
                    type="radio"
                    id="maker1"
                    name="makerNumber"
                    value="1"
                    checked={makerNumber === 1}
                    onChange={() => setMakerNumber(1)}
                    className="h-4 w-4"
                  />
                  <label htmlFor="maker1">I am Maker 1</label>
                  
                  <input
                    type="radio"
                    id="maker2"
                    name="makerNumber"
                    value="2"
                    checked={makerNumber === 2}
                    onChange={() => setMakerNumber(2)}
                    className="h-4 w-4"
                  />
                  <label htmlFor="maker2">I am Maker 2</label>
                </div>
                
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="h-10 w-10 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      {fileUpload ? fileUpload.name : "Click to select file or drag and drop"}
                    </p>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".xlsx, .xls"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                
                <Button
                  onClick={handleUpload}
                  disabled={!fileUpload || isUploading}
                  className="flex items-center gap-2 bg-black text-white"
                >
                  {isUploading ? "Uploading..." : "Upload File"}
                  <FileSpreadsheet className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Pending Files</h3>
            {isLoadingFiles ? (
              <p>Loading files...</p>
            ) : !pendingFiles || pendingFiles.length === 0 ? (
              <p className="text-sm text-gray-500">No pending files found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[0.8125rem] text-[rgba(0,0,0,0.87)] font-medium">File Name</TableHead>
                    <TableHead className="text-[0.8125rem] text-[rgba(0,0,0,0.87)] font-medium">Maker</TableHead>
                    <TableHead className="text-[0.8125rem] text-[rgba(0,0,0,0.87)] font-medium">Uploaded At</TableHead>
                    <TableHead className="text-[0.8125rem] text-[rgba(0,0,0,0.87)] font-medium">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingFiles.map((file) => (
                    <TableRow key={file.id} className="border-b border-[rgb(224,224,224)]">
                      <TableCell className="text-[0.8125rem] leading-[1.43] text-[rgba(0,0,0,0.87)]">{file.file_name}</TableCell>
                      <TableCell className="text-[0.8125rem] leading-[1.43] text-[rgba(0,0,0,0.87)]">Maker {file.maker_number}</TableCell>
                      <TableCell className="text-[0.8125rem] leading-[1.43] text-[rgba(0,0,0,0.87)]">
                        {format(new Date(file.created_at), "MMM d, yyyy, h:mm a")}
                      </TableCell>
                      <TableCell className="text-[0.8125rem] leading-[1.43] text-[rgba(0,0,0,0.87)]">{file.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Processed Files</h3>
            {isLoadingFiles ? (
              <p>Loading files...</p>
            ) : !processedFiles || processedFiles.length === 0 ? (
              <p className="text-sm text-gray-500">No processed files found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[0.8125rem] text-[rgba(0,0,0,0.87)] font-medium">File Name</TableHead>
                    <TableHead className="text-[0.8125rem] text-[rgba(0,0,0,0.87)] font-medium">Maker</TableHead>
                    <TableHead className="text-[0.8125rem] text-[rgba(0,0,0,0.87)] font-medium">Uploaded At</TableHead>
                    <TableHead className="text-[0.8125rem] text-[rgba(0,0,0,0.87)] font-medium">Processed At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedFiles.map((file) => (
                    <TableRow key={file.id} className="border-b border-[rgb(224,224,224)]">
                      <TableCell className="text-[0.8125rem] leading-[1.43] text-[rgba(0,0,0,0.87)]">{file.file_name}</TableCell>
                      <TableCell className="text-[0.8125rem] leading-[1.43] text-[rgba(0,0,0,0.87)]">Maker {file.maker_number}</TableCell>
                      <TableCell className="text-[0.8125rem] leading-[1.43] text-[rgba(0,0,0,0.87)]">
                        {format(new Date(file.created_at), "MMM d, yyyy, h:mm a")}
                      </TableCell>
                      <TableCell className="text-[0.8125rem] leading-[1.43] text-[rgba(0,0,0,0.87)]">
                        {file.processed_at ? format(new Date(file.processed_at), "MMM d, yyyy, h:mm a") : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
