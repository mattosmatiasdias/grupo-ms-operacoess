// src/components/escalas/StatCard.tsx
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: LucideIcon;
  variant: 'primary' | 'success' | 'warning' | 'accent';
}

export function StatCard({ title, value, subtitle, icon: Icon, variant }: StatCardProps) {
  const variantStyles = {
    primary: { bg: 'bg-blue-500/20', iconColor: 'text-blue-300' },
    success: { bg: 'bg-green-500/20', iconColor: 'text-green-300' },
    warning: { bg: 'bg-orange-500/20', iconColor: 'text-orange-300' },
    accent: { bg: 'bg-cyan-500/20', iconColor: 'text-cyan-300' },
  };

  const style = variantStyles[variant];

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-blue-200/30 hover:shadow-lg transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-200">{title}</p>
            <p className="text-3xl font-bold text-white mt-1">{value}</p>
            <p className="text-xs text-blue-300 mt-2">{subtitle}</p>
          </div>
          <div className={`p-3 rounded-lg ${style.bg}`}>
            <Icon className={`h-6 w-6 ${style.iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}