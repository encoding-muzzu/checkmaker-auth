
export interface ApplicationData {
  id: string;
  created_at: string;
  updated_at: string;
  arn: string;
  kit_no: string;
  customer_name: string;
  pan_number: string;
  total_amount_loaded: number;
  customer_type: string;
  product_variant: string;
  card_type: string;
  processing_type: string;
  itr_flag: string | null;
  status: string;
  status_id: number;
  status_name: string;
  lrs_amount_consumed: number;
  assigned_to?: string;
  application_number?: string | null;
  documents: {
    name: string;
    path: string;
    type: string;
  }[] | null;
}
