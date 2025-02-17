
export const getStatusColor = (statusId: number) => {
  const statusColors: Record<number, string> = {
    0: "bg-[#E5DEFF] text-[#8B5CF6]", // New Entry
    1: "bg-[#D3E4FD] text-[#0EA5E9]", // Maker Decision Pending Approval
    2: "bg-[#F2FCE2] text-green-600", // Approved by Checker
    3: "bg-[#FFDEE2] text-red-600",   // Rejected by Checker
    4: "bg-[#FDE1D3] text-orange-600" // Re-opened by Maker
  };
  return statusColors[statusId] || "";
};

export const getStatusText = (statusId: number, statusName?: string) => {
  return statusName || "Unknown";
};
