
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EntriesPerPageProps {
  value: string;
  onChange: (value: string) => void;
}

export const EntriesPerPage = ({ value, onChange }: EntriesPerPageProps) => {
  return (
    <div className="bg-white border-b border-[#e0e0e0] mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="entries-per-page" className="text-sm text-gray-600 whitespace-nowrap">
              Show entries
            </Label>
            <Select value={value} onValueChange={onChange}>
              <SelectTrigger className="w-[100px] bg-white border-gray-200">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="40">40</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};
