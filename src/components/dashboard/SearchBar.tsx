
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApplicationData } from "@/types/dashboard";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, Search } from "lucide-react";

interface SearchBarProps {
  setSearchResults: (results: ApplicationData[]) => void;
}

export function SearchBar({ setSearchResults }: SearchBarProps) {
  const [searchColumn, setSearchColumn] = useState("application_number");
  const [searchValue, setSearchValue] = useState("");
  const [searchType, setSearchType] = useState("all");
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date()
  });

  const handleSearch = async () => {
    try {
      // In a real application, you would fetch filtered data from your API
      // For now, we'll just simulate the search
      setSearchResults([]);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-white shadow rounded-md mb-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="search-field">Search By</Label>
          <Select
            value={searchColumn}
            onValueChange={setSearchColumn}
          >
            <SelectTrigger id="search-field">
              <SelectValue placeholder="Select Field" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="application_number">Application Number</SelectItem>
              <SelectItem value="arn">ARN</SelectItem>
              <SelectItem value="kit_no">Kit Number</SelectItem>
              <SelectItem value="customer_name">Customer Name</SelectItem>
              <SelectItem value="pan_number">PAN Number</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="search-value">Search Value</Label>
          <Input 
            id="search-value" 
            value={searchValue} 
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Enter search term"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="application-type">Application Type</Label>
          <Select
            value={searchType}
            onValueChange={setSearchType}
          >
            <SelectTrigger id="application-type">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="branch">Branch</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Date Range</Label>
          <div className="flex space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    format(dateRange.from, "PPP")
                  ) : (
                    <span>From Date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange.from}
                  onSelect={(date) => setDateRange({ ...dateRange, from: date || new Date() })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange.to && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.to ? (
                    format(dateRange.to, "PPP")
                  ) : (
                    <span>To Date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange.to}
                  onSelect={(date) => setDateRange({ ...dateRange, to: date || new Date() })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleSearch}
          className="flex items-center gap-2 bg-black hover:bg-gray-800"
        >
          <Search className="h-4 w-4" />
          Search
        </Button>
      </div>
    </div>
  );
}
