// src/components/PeriodDataTable.tsx
import { Period, CategoryData } from '@/hooks/useGoalsData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface PeriodDataTableProps {
  period: Period;
  onUpdate: (periodId: string, categoryId: string, field: keyof Pick<CategoryData, 'available' | 'realized' | 'goal'>, value: number) => void;
  onRemove: (periodId: string) => void;
  accumulated: CategoryData[];
}

export const PeriodDataTable = ({ period, onUpdate, onRemove, accumulated }: PeriodDataTableProps) => {
  const handleUpdate = (
    categoryId: string,
    field: keyof Pick<CategoryData, 'available' | 'realized' | 'goal'>,
    value: string
  ) => {
    const numValue = parseFloat(value) || 0;
    onUpdate(period.id, categoryId, field, numValue);
  };

  const getAccumulatedValue = (categoryName: string, field: keyof Pick<CategoryData, 'available' | 'realized' | 'goal'>) => {
    const cat = accumulated.find(c => c.name === categoryName);
    return cat ? cat[field] : 0;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">
            {period.label} ({period.year})
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {period.startDate} → {period.endDate}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(period.id)}
          className="h-8 w-8 text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Categoria</TableHead>
              <TableHead>Disponível (h)</TableHead>
              <TableHead>Realizado (h)</TableHead>
              <TableHead>Meta (h)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {period.categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={category.available}
                    onChange={(e) => handleUpdate(category.id, 'available', e.target.value)}
                    className="w-24 h-8"
                    step="0.1"
                    min="0"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={category.realized}
                    onChange={(e) => handleUpdate(category.id, 'realized', e.target.value)}
                    className="w-24 h-8"
                    step="0.1"
                    min="0"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={category.goal}
                    onChange={(e) => handleUpdate(category.id, 'goal', e.target.value)}
                    className="w-24 h-8"
                    step="0.1"
                    min="0"
                  />
                </TableCell>
              </TableRow>
            ))}
            {/* Linha de totais acumulados */}
            <TableRow className="bg-muted/50">
              <TableCell className="font-semibold">Total Acumulado</TableCell>
              <TableCell className="font-semibold">
                {accumulated.reduce((sum, cat) => sum + cat.available, 0).toFixed(1)}h
              </TableCell>
              <TableCell className="font-semibold">
                {accumulated.reduce((sum, cat) => sum + cat.realized, 0).toFixed(1)}h
              </TableCell>
              <TableCell className="font-semibold">
                {accumulated.reduce((sum, cat) => sum + cat.goal, 0).toFixed(1)}h
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};