
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SearchControlsProps {
  searchColumn: string;
  searchQuery: string;
  onSearchColumnChange: (value: string) => void;
  onSearchQueryChange: (value: string) => void;
  onSearch: () => void;
}

export const SearchControls = ({
  searchColumn,
  searchQuery,
  onSearchColumnChange,
  onSearchQueryChange,
  onSearch
}: SearchControlsProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="w-4 h-4 text-gray-500" />
        <Select value={searchColumn} onValueChange={onSearchColumnChange}>
          <SelectTrigger className="w-[180px] bg-white border-gray-200">
            <SelectValue placeholder="Select column" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="applicationId">Application ID</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="relative flex-1 sm:flex-initial">
          <Input
            type="search"
            placeholder="Search..."
            className="pl-9 pr-4 py-2 bg-white border-gray-200 w-full sm:w-[240px]"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        <Button 
          onClick={onSearch}
          className="bg-black text-white hover:bg-black/90 px-4"
        >
          Search
        </Button>
      </div>
    </div>
  );
};
