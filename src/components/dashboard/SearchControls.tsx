
import { Search, Calendar, Filter } from "lucide-react";
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
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
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
  statusFilter,
  onStatusFilterChange
}: SearchControlsProps) => {
  
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [applicationType, setApplicationType] = useState<string>("online");
  
  // Reset application type when switching to application_type from a different search column
  useEffect(() => {
    if (searchColumn === "application_type" && previousColumn !== "application_type") {
      setApplicationType("online");
      onSearchQueryChange("online"); // Set default value when switching to application_type
    }
  }, [searchColumn, previousColumn, onSearchQueryChange]);

  // Set today's date as default if no date is selected
  useEffect(() => {
    if (!dateRange.from && !dateRange.to) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      setDateRange({ from: today, to: today });
    }
  }, [dateRange, setDateRange]);

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
    return "Today";
  };

  // Handle application type change and update the search query
  const handleApplicationTypeChange = (value: string) => {
    setApplicationType(value);
    onSearchQueryChange(value);
  };

  // Filter out the date range and status options from searchable columns
  const filteredColumns = searchableColumns.filter(
    column => column.value !== "date_range" && column.value !== "status"
  );

  // Show application type dropdown if "application_type" is selected
  const showApplicationTypeDropdown = searchColumn === "application_type";
  
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={searchColumn} onValueChange={onSearchColumnChange}>
            <SelectTrigger className="w-[180px] bg-white border-gray-200">
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {filteredColumns.map(column => (
                <SelectItem key={column.value} value={column.value}>
                  {column.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {showApplicationTypeDropdown ? (
            <Select value={applicationType} onValueChange={handleApplicationTypeChange}>
              <SelectTrigger className="w-full sm:w-[240px] bg-white border-gray-200">
                <SelectValue placeholder="Select application type" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="bulk">Bulk</SelectItem>
              </SelectContent>
            </Select>
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

      {/* Date Range and Status Filters (moved outside dropdown) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
        {/* Date Range Picker */}
        <div className="flex items-center gap-2">
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
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-full sm:w-[240px] bg-white border-gray-200">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <span>{statusFilter === "" ? "All Statuses" : `Status: ${statusFilter}`}</span>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white z-50">
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="0">New Entry</SelectItem>
              <SelectItem value="1">Pending Approval</SelectItem>
              <SelectItem value="2">Approved</SelectItem>
              <SelectItem value="3">Rejected</SelectItem>
              <SelectItem value="4">On Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
