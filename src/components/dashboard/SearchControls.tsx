
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SearchControlsProps {
  searchColumn: string;
  searchQuery: string;
  onSearchColumnChange: (value: string) => void;
  onSearchQueryChange: (value: string) => void;
  onSearch: () => void;
  searchableColumns: Array<{ value: string; label: string }>;
}

export const SearchControls = ({
  searchColumn,
  searchQuery,
  onSearchColumnChange,
  onSearchQueryChange,
  onSearch,
  searchableColumns
}: SearchControlsProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Select value={searchColumn} onValueChange={onSearchColumnChange}>
          <SelectTrigger className="w-[180px] bg-white border-gray-200">
            <SelectValue placeholder="Select field" />
          </SelectTrigger>
          <SelectContent>
            {searchableColumns.map(column => (
              <SelectItem key={column.value} value={column.value}>
                {column.label}
              </SelectItem>
            ))}
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
          className="bg-black hover:bg-gray-800 text-white"
        >
          Search
        </Button>
      </div>
    </div>
  );
};
