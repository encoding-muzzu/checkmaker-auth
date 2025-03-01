
import { AlertCircle } from "lucide-react";

interface LrsLimitWarningProps {
  totalAmountLoaded: number;
  lrsAmountValue: number;
}

export const LrsLimitWarning = ({ 
  totalAmountLoaded, 
  lrsAmountValue 
}: LrsLimitWarningProps) => {
  return (
    <div className="mt-4 mb-2 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
      <AlertCircle className="h-5 w-5 text-amber-500" />
      <p className="text-amber-700 text-sm">
        Warning: Total amount ($
        {totalAmountLoaded.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) 
        plus LRS amount (${lrsAmountValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) 
        exceeds $250,000 limit. Approval is not allowed.
      </p>
    </div>
  );
};
