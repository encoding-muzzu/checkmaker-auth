
export interface BulkFile {
  id: string;
  file_name: string;
  file_path: string;
  created_at: string;
  status: string;
  record_count: number | null;
  maker_processed: boolean;
  maker_processed_at: string | null;
  maker_user_id: string | null;
  checker_processed: boolean;
  checker_processed_at: string | null;
  checker_user_id: string | null;
}

export type ProcessingRole = 'maker' | 'checker';
