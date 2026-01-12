'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

export interface StatCardData {
  title: string;
  value: number | string;
  description?: string;
  icon: LucideIcon;
  iconColor?: string;
  textColor?: string;
  gradient?: boolean;
}

interface StatCardProps {
  data: StatCardData;
}

export function StatCard({ data }: StatCardProps) {
  const { title, value, description, icon: Icon, iconColor, textColor, gradient } = data;

  return (
    <Card 
      className={
        gradient 
          ? "bg-gradient-to-br from-emerald-500 to-emerald-700 text-white" 
          : ""
      }
      style={
        gradient 
          ? { background: 'linear-gradient(to bottom right, var(--brand-primary), var(--brand-primary-dark))' }
          : undefined
      }
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${gradient ? 'opacity-70' : iconColor || 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${gradient ? '' : textColor || ''}`}>
          {value}
        </div>
        {description && (
          <p className={`text-xs mt-1 ${gradient ? 'opacity-80' : 'text-muted-foreground'}`}>
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface StatsCardsProps {
  stats: StatCardData[];
  columns?: 2 | 3 | 4;
}

export function StatsCards({ stats, columns = 3 }: StatsCardsProps) {
  const gridClass = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  }[columns];

  return (
    <div className={`grid gap-4 ${gridClass}`}>
      {stats.map((stat, index) => (
        <StatCard key={index} data={stat} />
      ))}
    </div>
  );
}
