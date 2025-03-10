
interface TabButtonProps {
  isActive: boolean;
  label: string;
  count?: number;
  onClick: () => void;
}

export const TabButton = ({ isActive, label, count, onClick }: TabButtonProps) => {
  return (
    <button
      className={isActive
        ? "pb-4 px-1 relative text-black font-medium before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-black"
        : "pb-4 px-1 relative text-gray-500 hover:text-gray-800 transition-colors"}
      onClick={onClick}
    >
      {label} {count !== undefined ? `(${count})` : ''}
    </button>
  );
};
