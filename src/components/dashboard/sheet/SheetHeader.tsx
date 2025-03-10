
import React from "react";

interface SheetHeaderProps {
  title: string;
}

export const SheetHeader = ({ title }: SheetHeaderProps) => {
  return (
    <div className="p-6 border-b">
      <h2 className="text-xl font-semibold text-black">{title}</h2>
    </div>
  );
};
