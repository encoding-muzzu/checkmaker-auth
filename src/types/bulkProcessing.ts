
export interface BulkFile {
  id: string;
  file_name: string;
  file_path: string;
  uploaded_by: string;
  maker_number: number;
  created_at: string;
  status: string;
  processed_at: string | null;
}

export interface GeneratedBulkFile {
  id: string;
  file_name: string;
  file_path: string;
  created_at: string;
  record_count: number | null;
  is_auto_generated: boolean;
}

export interface BulkProcessingResult {
  id: string;
  application_id: string;
  status: string;
  message: string | null;
  created_at: string;
  maker1_file_id: string;
  maker2_file_id: string;
  maker1_itr_flag: string | null;
  maker1_lrs_amount: number | null;
  maker1_total_amount: number | null;
  maker2_itr_flag: string | null;
  maker2_lrs_amount: number | null;
  maker2_total_amount: number | null;
}
