import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Category } from '@/types/User';
import { Pencil } from 'lucide-react';

interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onToggleStatus: (id: string) => void;
}

const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  onEdit,
  onToggleStatus,
}) => {
  return (
    <div className="w-full overflow-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Name</TableHead>
            <TableHead className="w-[250px]">MET</TableHead>
            <TableHead className="hidden md:table-cell">Description</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                No categories found
              </TableCell>
            </TableRow>
          ) : (
            categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="font-medium">
                  {(category.metValue !== undefined && category.metValue !== null) 
                    ? category.metValue 
                    : (category.metValue !== undefined && category.metValue !== null) 
                      ? category.metValue 
                      : 'N/A'}
                </TableCell>
                <TableCell className="hidden md:table-cell line-clamp-2">
                  {category.description || 'No description'}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center">
                    <Switch
                      checked={category.isListed}
                      onCheckedChange={() => onToggleStatus(category.id)}
                      aria-label="Toggle category status"
                    />
                    <span className="ml-2 text-xs text-muted-foreground">
                      {category.isListed ? 'Listed' : 'Unlisted'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onEdit(category)}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CategoryTable;