// src/hooks/useGoalsData.ts
import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface CategoryData {
  id: string;
  name: string;
  available: number;
  realized: number;
  goal: number;
}

export interface Period {
  id: string;
  year: number;
  label: string;
  startDate: string;
  endDate: string;
  categories: CategoryData[];
}

// Categorias padrão do sistema
const DEFAULT_CATEGORIES: Omit<CategoryData, 'id'>[] = [
  { name: 'Disponível', available: 0, realized: 0, goal: 0 },
  { name: 'Realizado', available: 0, realized: 0, goal: 0 },
  { name: 'Meta', available: 0, realized: 0, goal: 0 },
];

export const useGoalsData = () => {
  const [periods, setPeriods] = useState<Period[]>([]);

  const addPeriod = useCallback((year: number, startDate: string, endDate: string, label: string) => {
    const newPeriod: Period = {
      id: uuidv4(),
      year,
      label,
      startDate,
      endDate,
      categories: DEFAULT_CATEGORIES.map(cat => ({
        ...cat,
        id: uuidv4(),
      })),
    };
    setPeriods(prev => [...prev, newPeriod]);
  }, []);

  const updateCategoryValue = useCallback((
    periodId: string,
    categoryId: string,
    field: keyof Pick<CategoryData, 'available' | 'realized' | 'goal'>,
    value: number
  ) => {
    setPeriods(prev => prev.map(period => {
      if (period.id !== periodId) return period;
      
      return {
        ...period,
        categories: period.categories.map(cat => {
          if (cat.id !== categoryId) return cat;
          return { ...cat, [field]: value };
        }),
      };
    }));
  }, []);

  const removePeriod = useCallback((periodId: string) => {
    setPeriods(prev => prev.filter(p => p.id !== periodId));
  }, []);

  const getPeriodAccumulated = useCallback((periodId: string) => {
    const period = periods.find(p => p.id === periodId);
    if (!period) return [];

    // Retorna os dados do período como estão (já são acumulados)
    return period.categories;
  }, [periods]);

  const getYearAccumulated = useCallback((year: number) => {
    const yearPeriods = periods.filter(p => p.year === year);
    if (yearPeriods.length === 0) return [];

    // Acumular todos os períodos do ano
    const accumulated = yearPeriods.reduce<CategoryData[]>((acc, period) => {
      period.categories.forEach(cat => {
        const existingCat = acc.find(c => c.name === cat.name);
        if (existingCat) {
          existingCat.available += cat.available;
          existingCat.realized += cat.realized;
          existingCat.goal += cat.goal;
        } else {
          acc.push({
            id: cat.id,
            name: cat.name,
            available: cat.available,
            realized: cat.realized,
            goal: cat.goal,
          });
        }
      });
      return acc;
    }, []);

    return accumulated;
  }, [periods]);

  const getYears = useCallback(() => {
    const yearsSet = new Set(periods.map(p => p.year));
    return Array.from(yearsSet).sort((a, b) => b - a); // Ordena decrescente
  }, [periods]);

  return {
    periods,
    addPeriod,
    updateCategoryValue,
    removePeriod,
    getPeriodAccumulated,
    getYearAccumulated,
    getYears,
  };
};