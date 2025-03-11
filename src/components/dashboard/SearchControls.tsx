
import { Search, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface SearchControlsProps {
  searchColumn: string;
  searchQuery: string;
  onSearchColumnChange: (value: string) => void;
  onSearchQueryChange: (value: string) => void;
  onSearch: () => void;
  searchableColumns: Array<{ value: string; label: string }>;
  dateRange: { from: Date | undefined; to: Date | undefined };
  setDateRange: (range: { from: Date | undefined; to: Date | undefined }) => void;
}

export const SearchControls = ({
  searchColumn,
  searchQuery,
  onSearchColumnChange,
  onSearchQueryChange,
  onSearch,
  searchableColumns,
  dateRange,
  setDateRange
}: SearchControlsProps) => {
  
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!dateRange.from) {
      setDateRange({ ...dateRange, from: date });
    } else if (!dateRange.to && date && date > dateRange.from) {
      setDateRange({ ...dateRange, to: date });
      setCalendarOpen(false);
    } else {
      setDateRange({ from: date, to: undefined });
    }
  };

  // Format the date range for display
  const formatDateRange = () => {
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, 'PP')} - ${format(dateRange.to, 'PP')}`;
    } else if (dateRange.from) {
      return `From: ${format(dateRange.from, 'PP')}`;
    }
    return "Select date range";
  };

  // Show date range picker if "date_range" is selected
  const showDateRangePicker = searchColumn === "date_range";
  
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Select value={searchColumn} onValueChange={(value) => {
          onSearchColumnChange(value);
          if (value === "date_range") {
            setDateRange({ from: undefined, to: undefined });
          }
        }}>
          <SelectTrigger className="w-[180px] bg-white border-gray-200">
            <SelectValue placeholder="Select field" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {searchableColumns.map(column => (
              <SelectItem key={column.value} value={column.value}>
                {column.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        {showDateRangePicker ? (
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full sm:w-[240px] justify-start text-left font-normal bg-white border-gray-200",
                  !dateRange.from && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {formatDateRange()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white" align="start">
              <CalendarComponent
                mode="single"
                selected={dateRange.to || dateRange.from}
                onSelect={handleDateSelect}
                initialFocus
                className="p-3 pointer-events-auto"
                disabled={date => 
                  (dateRange.from && date < dateRange.from)
                }
              />
            </PopoverContent>
          </Popover>
        ) : (
          <div className="relative flex-1 sm:flex-initial">
            <Input
              type="search"
              placeholder="Search..."
              className="pl-9 pr-4 py-2 bg-white border-gray-200 w-full sm:w-[240px]"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        )}
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
