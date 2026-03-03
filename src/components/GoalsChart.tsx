// src/components/GoalsChart.tsx
import { CategoryData } from '@/hooks/useGoalsData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface GoalsChartProps {
  title: string;
  subtitle?: string;
  data: CategoryData[];
}

export const GoalsChart = ({ title, subtitle, data }: GoalsChartProps) => {
  const chartData = data.map(cat => ({
    name: cat.name,
    Disponível: cat.available,
    Realizado: cat.realized,
    Meta: cat.goal,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Disponível" fill="#3b82f6" />
              <Bar dataKey="Realizado" fill="#10b981" />
              <Bar dataKey="Meta" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};