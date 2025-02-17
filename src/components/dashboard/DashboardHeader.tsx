
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface DashboardHeaderProps {
  userRole: string | null;
  onLogout: () => Promise<void>;
}

export const DashboardHeader = ({ userRole, onLogout }: DashboardHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">{userRole === 'checker' ? 'Checker' : 'Maker'} Dashboard</h1>
      <Button 
        onClick={onLogout}
        className="flex items-center gap-2 bg-black hover:bg-gray-800"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </div>
  );
};
