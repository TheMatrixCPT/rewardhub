
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DataRow = [string, number];

interface DemographicsTableProps {
  title: string;
  data: DataRow[];
  sortType: "name" | "count";
  onSortChange: (value: string) => void;
}

export const DemographicsTable = ({
  title,
  data,
  sortType,
  onSortChange,
}: DemographicsTableProps) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Select value={sortType} onValueChange={onSortChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="count">By Count</SelectItem>
            <SelectItem value="name">By Name</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{title}</TableHead>
            <TableHead className="text-right">Count</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map(([name, count]) => (
            <TableRow key={name}>
              <TableCell>{name}</TableCell>
              <TableCell className="text-right">{count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
