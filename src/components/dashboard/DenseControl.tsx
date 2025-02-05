
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface DenseControlProps {
  isDense: boolean;
  onDenseChange: (checked: boolean) => void;
}

export const DenseControl = ({ isDense, onDenseChange }: DenseControlProps) => {
  return (
    <div className="flex items-center gap-2 ml-6">
      <Label htmlFor="dense-mode" className="text-sm text-gray-600 whitespace-nowrap">
        Dense Padding
      </Label>
      <Switch
        id="dense-mode"
        checked={isDense}
        onCheckedChange={onDenseChange}
      />
    </div>
  );
};
