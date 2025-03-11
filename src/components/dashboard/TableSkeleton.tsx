
import { TableRow, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export const TableSkeleton = () => {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <TableRow key={i} className="animate-pulse">
          <TableCell className="py-4">
            <Skeleton className="h-5 w-32" />
          </TableCell>
          <TableCell className="py-4">
            <Skeleton className="h-5 w-24" />
          </TableCell>
          <TableCell className="py-4">
            <Skeleton className="h-5 w-20" />
          </TableCell>
          <TableCell className="py-4">
            <Skeleton className="h-5 w-20" />
          </TableCell>
          <TableCell className="py-4">
            <Skeleton className="h-5 w-16" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};
