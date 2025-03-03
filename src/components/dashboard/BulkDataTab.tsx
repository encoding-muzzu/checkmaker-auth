
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, Download, Upload, FileIcon } from "lucide-react";
import { useBulkProcessing, BulkFile } from "@/hooks/useBulkProcessing";
import { format } from "date-fns";

export const BulkDataTab = () => {
  const {
    bulkFiles,
    isLoading,
    downloadFile,
    uploadFile,
    refreshData,
    isUploading,
    canUploadAsMaker1,
    canUploadAsMaker2
  } = useBulkProcessing();

  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [selectedMakerType, setSelectedMakerType] = useState<string | null>(null);

  const handleDownload = (file: BulkFile) => {
    console.log("Handling download for file:", file.file_path);
    let filePath = file.file_path;
    
    // If maker1 has processed the file and we're not downloading for maker1 upload
    if (file.maker1_processed && !canUploadAsMaker1(file)) {
      const pathParts = file.file_path.split("/");
      const fileName = pathParts[pathParts.length - 1].split(".")[0];
      filePath = `exports/${fileName}_maker1.xlsx`;
    }
    
    downloadFile(filePath);
  };

  const handleUploadClick = (file: BulkFile, makerType: string) => {
    console.log(`Setting up upload for ${makerType}:`, file.id);
    setSelectedFileId(file.id);
    setSelectedMakerType(makerType);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedFileId || !selectedMakerType) {
      console.log("No file selected or missing file ID/maker type");
      return;
    }

    const file = files[0];
    console.log(`Uploading file for ${selectedMakerType}:`, file.name);
    uploadFile(file, selectedFileId, selectedMakerType);
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getStatus = (file: BulkFile) => {
    if (file.maker2_processed) {
      return "Processed by Maker 2";
    } else if (file.maker1_processed) {
      return "Processed by Maker 1";
    } else {
      return "Pending";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Bulk Data Processing</h2>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={refreshData} 
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Auto-Generated Files</CardTitle>
          <CardDescription>
            Files are generated automatically for bulk processing. Maker 1 downloads, updates, and uploads the file.
            Then Maker 2 downloads the updated file, adds additional updates, and uploads the final version.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bulkFiles && bulkFiles.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bulkFiles.map((file) => (
                    <TableRow 
                      key={file.id}
                      onMouseEnter={() => setHoveredRow(file.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      className="hover:bg-gray-50"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <FileIcon className="h-4 w-4" />
                          <span>{file.file_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(file.created_at), "MMM dd, yyyy HH:mm")}
                      </TableCell>
                      <TableCell>{file.record_count || "N/A"}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          file.maker2_processed 
                            ? "bg-green-100 text-green-800" 
                            : file.maker1_processed 
                              ? "bg-yellow-100 text-yellow-800" 
                              : "bg-blue-100 text-blue-800"
                        }`}>
                          {getStatus(file)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(file)}
                            title="Download file"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Download</span>
                          </Button>
                          
                          {canUploadAsMaker1(file) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUploadClick(file, "maker1")}
                              disabled={isUploading}
                              title="Upload as Maker 1"
                            >
                              <Upload className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">Maker 1</span>
                            </Button>
                          )}
                          
                          {canUploadAsMaker2(file) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUploadClick(file, "maker2")}
                              disabled={isUploading}
                              title="Upload as Maker 2"
                            >
                              <Upload className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">Maker 2</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {isLoading ? "Loading..." : "No files found. Files are generated automatically."}
            </div>
          )}
          
          {/* Hidden file input for upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx"
            className="hidden"
          />
        </CardContent>
        <CardFooter className="bg-gray-50 text-sm text-gray-500 p-4">
          Files are generated automatically every 5 minutes for applications that need bulk processing.
        </CardFooter>
      </Card>
    </div>
  );
};
