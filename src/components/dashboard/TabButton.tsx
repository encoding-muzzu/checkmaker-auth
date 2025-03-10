
interface TabButtonProps {
  isActive: boolean;
  label: string;
  count?: number;
  totalCount?: number;
  onClick: () => void;
  disabled?: boolean;
}

export const TabButton = ({ 
  isActive, 
  label, 
  count, 
  totalCount, 
  onClick, 
  disabled = false 
}: TabButtonProps) => {
  return (
    <button
      className={isActive
        ? "pb-4 px-1 relative text-black font-medium before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-black"
        : "pb-4 px-1 relative text-gray-500 hover:text-gray-800 transition-colors"}
      onClick={onClick}
      disabled={disabled}
      style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
    >
      {label} {count !== undefined ? `(${count})` : ''} 
      {totalCount !== undefined && totalCount > 0 && count !== undefined ? ` / ${totalCount}` : ''}
    </button>
  );
};
