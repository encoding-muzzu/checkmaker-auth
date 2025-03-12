
import { Search, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useState, useEffect } from "react";
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
  previousColumn?: string | null;
  applicationStatus: string;
  onApplicationStatusChange: (status: string) => void;
}

export const SearchControls = ({
  searchColumn,
  searchQuery,
  onSearchColumnChange,
  onSearchQueryChange,
  onSearch,
  searchableColumns,
  dateRange,
  setDateRange,
  previousColumn,
  applicationStatus,
  onApplicationStatusChange
}: SearchControlsProps) => {
  
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  // Format the date range for display - focus on date only (not time)
  const formatDateRange = () => {
    if (dateRange.from && dateRange.to) {
      const fromStr = format(dateRange.from, 'yyyy-MM-dd');
      const toStr = format(dateRange.to, 'yyyy-MM-dd');
      
      if (fromStr === toStr) {
        // Same day selected - show only one date
        return `${format(dateRange.from, 'PP')}`;
      } else {
        // Date range - show start and end dates
        return `${format(dateRange.from, 'PP')} - ${format(dateRange.to, 'PP')}`;
      }
    } else if (dateRange.from) {
      return `From: ${format(dateRange.from, 'PP')}`;
    }
    return "Select date range";
  };
  
  // Filter out the application_type option from searchableColumns
  const filteredSearchColumns = searchableColumns.filter(column => column.value !== "application_type");
  
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full flex-wrap">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Select value={searchColumn} onValueChange={onSearchColumnChange}>
          <SelectTrigger className="w-[180px] bg-white border-gray-200">
            <SelectValue placeholder="Select field" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {filteredSearchColumns.map(column => (
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
            onKeyPress={handleKeyPress}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Date Range Picker - Always visible */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-[230px] justify-start text-left font-normal bg-white border-gray-200 truncate overflow-hidden",
                !dateRange.from && "text-muted-foreground"
              )}
            >
              <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="truncate">{formatDateRange()}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-white" align="start">
            <CalendarComponent
              mode="range"
              selected={{
                from: dateRange.from,
                to: dateRange.to
              }}
              onSelect={(range) => {
                if (range) {
                  // If only from date is selected, set both from and to to the same date
                  if (range.from && !range.to) {
                    // Create date at start of day
                    const startOfDay = new Date(range.from);
                    startOfDay.setHours(0, 0, 0, 0);
                    
                    // Create date at end of day 
                    const endOfDay = new Date(range.from);
                    endOfDay.setHours(23, 59, 59, 999);
                    
                    setDateRange({
                      from: startOfDay,
                      to: endOfDay
                    });
                  } else {
                    // Set proper start/end of day for date ranges
                    const startDate = range.from ? new Date(range.from) : undefined;
                    if (startDate) startDate.setHours(0, 0, 0, 0);
                    
                    const endDate = range.to ? new Date(range.to) : undefined;
                    if (endDate) endDate.setHours(23, 59, 59, 999);
                    
                    setDateRange({
                      from: startDate,
                      to: endDate
                    });
                  }
                  
                  if (range.to || (range.from && !range.to)) {
                    setCalendarOpen(false);
                  }
                }
              }}
              initialFocus
              numberOfMonths={1}
              className="p-3 pointer-events-auto"
              fixedWeeks
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Application Status Dropdown - Always visible */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Select value={applicationStatus} onValueChange={onApplicationStatusChange}>
          <SelectTrigger className="w-full sm:w-[150px] bg-white border-gray-200">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-white z-50">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="bulk">Bulk</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button 
        onClick={onSearch}
        className="bg-black hover:bg-gray-800 text-white"
      >
        Search
      </Button>
    </div>
  );
};
