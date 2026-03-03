// src/components/ContractFormDialog.tsx
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { saveContract } from '@/store/contractStore';
import { Contract } from '@/types/contracts';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ContractFormDialog({ open, onOpenChange }: Props) {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    numero: '', 
    fornecedor: '', 
    cnpj: '', 
    objeto: '',
    tipo: 'servico' as 'servico' | 'locacao', 
    valorTotal: '', 
    dataInicio: '', 
    dataFim: '', 
    numeroPedido: '',
  });

  const handleSave = async () => {
    if (!userProfile?.id) {
      toast({ title: "Erro", description: "Usuário não identificado.", variant: "destructive" });
      return;
    }

    if (!form.numero || !form.fornecedor || !form.valorTotal) {
      toast({ title: "Atenção", description: "Preencha os campos obrigatórios (Número, Fornecedor, Valor).", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      const contract: Contract = {
        id: crypto.randomUUID(), // ID temporário para o frontend
        user_id: userProfile.id, // OBRIGATÓRIO para o banco
        numero: form.numero,
        fornecedor: form.fornecedor,
        cnpj: form.cnpj,
        objeto: form.objeto,
        tipo: form.tipo,
        tipoLabel: form.tipo === 'servico' ? 'Prestação de Serviços' : 'Locação',
        valorTotal: parseFloat(form.valorTotal) || 0,
        dataInicio: form.dataInicio,
        dataFim: form.dataFim,
        numeroPedido: form.numeroPedido,
      };

      await saveContract(contract);
      
      toast({ 
        title: "Sucesso!", 
        description: "Contrato criado com sucesso." 
      });
      
      onOpenChange(false); // Fecha o modal
      
      // Reset do formulário
      setForm({
        numero: '', fornecedor: '', cnpj: '', objeto: '',
        tipo: 'servico', valorTotal: '', dataInicio: '', dataFim: '', numeroPedido: '',
      });
    } catch (error) {
      console.error(error);
      toast({ 
        title: "Erro", 
        description: "Não foi possível salvar o contrato.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 text-slate-200 border-slate-800 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">Novo Contrato</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numero" className="text-slate-400">Nº do Contrato *</Label>
              <Input 
                id="numero" 
                value={form.numero} 
                onChange={e => setForm(p => ({ ...p, numero: e.target.value }))} 
                className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-600"
                placeholder="Ex: 001/2024"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numeroPedido" className="text-slate-400">Nº Pedido</Label>
              <Input 
                id="numeroPedido" 
                value={form.numeroPedido} 
                onChange={e => setForm(p => ({ ...p, numeroPedido: e.target.value }))} 
                className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fornecedor" className="text-slate-400">Fornecedor *</Label>
            <Input 
              id="fornecedor" 
              value={form.fornecedor} 
              onChange={e => setForm(p => ({ ...p, fornecedor: e.target.value }))} 
              className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-600"
              placeholder="Nome da empresa"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnpj" className="text-slate-400">CNPJ</Label>
            <Input 
              id="cnpj" 
              value={form.cnpj} 
              onChange={e => setForm(p => ({ ...p, cnpj: e.target.value }))} 
              className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-600"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="objeto" className="text-slate-400">Objeto do Contrato</Label>
            <Input 
              id="objeto" 
              value={form.objeto} 
              onChange={e => setForm(p => ({ ...p, objeto: e.target.value }))} 
              className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-600"
              placeholder="Descrição resumida do serviço"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo" className="text-slate-400">Tipo</Label>
              <Select value={form.tipo} onValueChange={(v: any) => setForm(p => ({ ...p, tipo: v }))}>
                <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-950 border-slate-700 text-white">
                  <SelectItem value="servico">Prestação de Serviços</SelectItem>
                  <SelectItem value="locacao">Locação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="valorTotal" className="text-slate-400">Valor Total (R$) *</Label>
              <Input 
                id="valorTotal" 
                type="number" 
                step="0.01"
                value={form.valorTotal} 
                onChange={e => setForm(p => ({ ...p, valorTotal: e.target.value }))} 
                className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataInicio" className="text-slate-400">Início da Vigência</Label>
              <Input 
                id="dataInicio" 
                type="date" 
                value={form.dataInicio} 
                onChange={e => setForm(p => ({ ...p, dataInicio: e.target.value }))} 
                className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataFim" className="text-slate-400">Fim da Vigência</Label>
              <Input 
                id="dataFim" 
                type="date" 
                value={form.dataFim} 
                onChange={e => setForm(p => ({ ...p, dataFim: e.target.value }))} 
                className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-600"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="bg-slate-950/50 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            className="bg-rose-600 hover:bg-rose-700 text-white"
          >
            {isLoading ? 'Salvando...' : 'Salvar Contrato'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}