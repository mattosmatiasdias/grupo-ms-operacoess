// src/components/ContractFormDialog.tsx
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface ContractFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => void;
}

const ContractFormDialog = ({ open, onOpenChange, onSave }: ContractFormDialogProps) => {
  const [formData, setFormData] = useState({
    numero: '',
    numero_pedido: '',
    fornecedor: '',
    objeto: '',
    tipo: 'obra',
    tipo_label: 'Obra',
    valor_total: 0,
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: '',
    observacoes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setFormData({
      numero: '',
      numero_pedido: '',
      fornecedor: '',
      objeto: '',
      tipo: 'obra',
      tipo_label: 'Obra',
      valor_total: 0,
      data_inicio: new Date().toISOString().split('T')[0],
      data_fim: '',
      observacoes: ''
    });
  };

  const tipos = [
    { value: 'obra', label: 'Obra' },
    { value: 'servico', label: 'Serviço' },
    { value: 'fornecimento', label: 'Fornecimento' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Novo Contrato</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numero" className="text-slate-300">Número do Contrato *</Label>
              <Input
                id="numero"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numero_pedido" className="text-slate-300">Número do Pedido</Label>
              <Input
                id="numero_pedido"
                value={formData.numero_pedido}
                onChange={(e) => setFormData({ ...formData, numero_pedido: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fornecedor" className="text-slate-300">Fornecedor *</Label>
            <Input
              id="fornecedor"
              value={formData.fornecedor}
              onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="objeto" className="text-slate-300">Objeto do Contrato</Label>
            <Textarea
              id="objeto"
              value={formData.objeto}
              onChange={(e) => setFormData({ ...formData, objeto: e.target.value })}
              className="bg-slate-800 border-slate-700 text-white min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo" className="text-slate-300">Tipo *</Label>
              <Select 
                value={formData.tipo}
                onValueChange={(value) => {
                  const tipo = tipos.find(t => t.value === value);
                  setFormData({ 
                    ...formData, 
                    tipo: value as any,
                    tipo_label: tipo?.label || value
                  });
                }}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  {tipos.map(tipo => (
                    <SelectItem key={tipo.value} value={tipo.value} className="text-white hover:bg-slate-700">
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="valor_total" className="text-slate-300">Valor Total (R$) *</Label>
              <Input
                id="valor_total"
                type="number"
                step="0.01"
                min="0"
                value={formData.valor_total}
                onChange={(e) => setFormData({ ...formData, valor_total: parseFloat(e.target.value) || 0 })}
                className="bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_inicio" className="text-slate-300">Data Início *</Label>
              <Input
                id="data_inicio"
                type="date"
                value={formData.data_inicio}
                onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_fim" className="text-slate-300">Data Fim *</Label>
              <Input
                id="data_fim"
                type="date"
                value={formData.data_fim}
                onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes" className="text-slate-300">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
              Salvar Contrato
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContractFormDialog;