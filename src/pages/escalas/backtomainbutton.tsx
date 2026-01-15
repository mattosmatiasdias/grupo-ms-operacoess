// src/components/escalas/BackToMainButton.tsx
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function BackToMainButton() {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate('/')}
      className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
    >
      <Home className="h-4 w-4" />
      Menu Principal
    </Button>
  );
}

export function BackButton({ to = '/', label = 'Voltar' }: { to?: string; label?: string }) {
  const navigate = useNavigate();

  return (
    <Button
      variant="outline"
      onClick={() => navigate(to)}
      className="bg-white/5 border-blue-200/30 text-blue-300 hover:bg-blue-500/20 hover:text-blue-200 gap-2"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  );
}