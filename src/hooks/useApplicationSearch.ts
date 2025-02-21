
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ApplicationData } from "@/types/dashboard";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export const useApplicationSearch = () => {
  const [searchColumn, setSearchColumn] = useState("id");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ApplicationData[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery || !searchColumn) {
      toast({
        title: "Search Error",
        description: "Please select a field and enter a search term",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      }

      let query = supabase
        .from('applications')
        .select(`
          *,
          application_statuses!fk_status (
            id,
            name
          )
        `);

      if (searchColumn === 'id') {
        query = query.eq(searchColumn, searchQuery);
      } else {
        query = query.ilike(searchColumn, `%${searchQuery}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Search error:', error);
        toast({
          title: "Search Error",
          description: "Failed to perform search",
          variant: "destructive",
          duration: 5000,
        });
        return;
      }

      setSearchResults(
        (data || []).map((app: any) => ({
          ...app,
          status_name: app.application_statuses.name,
          documents: app.documents || []
        })) as ApplicationData[]
      );
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to perform search",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return {
    searchColumn,
    setSearchColumn,
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    handleSearch
  };
};
