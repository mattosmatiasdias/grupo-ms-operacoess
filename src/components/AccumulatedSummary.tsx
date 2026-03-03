// src/components/AccumulatedSummary.tsx
import { CategoryData } from '@/hooks/useGoalsData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface AccumulatedSummaryProps {
  title: string;
  data: CategoryData[];
}

export const AccumulatedSummary = ({ title, data }: AccumulatedSummaryProps) => {
  const totalAvailable = data.reduce((sum, cat) => sum + cat.available, 0);
  const totalRealized = data.reduce((sum, cat) => sum + cat.realized, 0);
  const totalGoal = data.reduce((sum, cat) => sum + cat.goal, 0);
  
  const realizationPercentage = totalGoal > 0 ? (totalRealized / totalGoal) * 100 : 0;
  const availabilityPercentage = totalGoal > 0 ? (totalAvailable / totalGoal) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Disponível</span>
            <span className="font-medium">{totalAvailable.toFixed(1)}h</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Realizado</span>
            <span className="font-medium">{totalRealized.toFixed(1)}h</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Meta</span>
            <span className="font-medium">{totalGoal.toFixed(1)}h</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Realizado vs Meta</span>
              <span>{realizationPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={realizationPercentage} className="h-2" />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Disponível vs Meta</span>
              <span>{availabilityPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={availabilityPercentage} className="h-2" />
          </div>
        </div>

        {/* Detalhamento por categoria */}
        <div className="mt-4 space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Por Categoria
          </h4>
          {data.map((cat) => {
            const catRealization = cat.goal > 0 ? (cat.realized / cat.goal) * 100 : 0;
            return (
              <div key={cat.id} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>{cat.name}</span>
                  <span>{cat.realized.toFixed(1)}h / {cat.goal.toFixed(1)}h</span>
                </div>
                <Progress value={catRealization} className="h-1.5" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};