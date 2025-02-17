
export const getStatusColor = (statusId: number) => {
  const statusColors: Record<number, string> = {
    0: "bg-[#E5DEFF] text-[#8B5CF6]", // New
    1: "bg-[#D3E4FD] text-[#0EA5E9]", // Initiated By Maker
    2: "bg-[#F2FCE2] text-green-600", // Approved By Checker
    3: "bg-[#FFDEE2] text-red-600",   // Rejected By Checker
    4: "bg-[#FDE1D3] text-orange-600" // Re Opened
  };
  return statusColors[statusId] || "";
};

export const getStatusText = (statusId: number) => {
  const statusTexts: Record<number, string> = {
    0: "New",
    1: "Initiated By Maker",
    2: "Approved By Checker",
    3: "Rejected By Checker",
    4: "Re Opened"
  };
  return statusTexts[statusId] || "Unknown";
};
