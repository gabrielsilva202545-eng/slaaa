import React, { useEffect, useState } from 'react';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle2,
  Lock,
  MapPin,
  Unlock,
  X,
} from 'lucide-react';
import { WarehouseSlot } from '../types/wms';
import { LEVEL_LABELS, formatDateTimeBr } from '../utils/warehouse';

interface SlotInspectorProps {
  slot: WarehouseSlot | null;
  onClose: () => void;
  onPutaway: (
    slotId: string,
    payload: { sku: string; name: string; quantity: number; unit: string }
  ) => void;
  onPicking: (slotId: string, quantityToPick: number, note?: string) => void;
  onBlockSlot: (slotId: string, reason: string) => void;
  onUnblockSlot: (slotId: string) => void;
}

export function SlotInspector({
  slot,
  onClose,
  onPutaway,
  onPicking,
  onBlockSlot,
  onUnblockSlot,
}: SlotInspectorProps) {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('un');
  const [pickQty, setPickQty] = useState('');
  const [pickNote, setPickNote] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    setShowBlockForm(false);
    setBlockReason('');
    setPickNote('');
    if (slot?.status === 'OCUPADO' && slot.item) {
      setPickQty(String(slot.item.quantity));
    } else {
      setPickQty('');
    }
  }, [slot?.id, slot?.status, slot?.item?.quantity]);

  if (!slot) {
    return (
      <aside className="bg-white border border-slate-200 rounded-xl p-5 sticky top-20">
        <div className="flex items-center gap-2.5 text-slate-900 font-semibold text-sm">
          <MapPin className="h-4 w-4 text-blue-700" />
          <span>Inspetor de Posição</span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          Selecione qualquer uma das 150 posições no mapa ao lado para visualizar detalhes do palete, endereçar mercadorias (Putaway), registrar saída (Picking) ou bloquear/liberar o endereço.
        </p>
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Estrutura física</span>
            <span className="font-mono font-medium text-slate-800">6 Ruas · 30 Módulos</span>
          </div>
          <div className="flex justify-between">
            <span>Altura porta-paletes</span>
            <span className="font-mono font-medium text-slate-800">5 Níveis (N1–N5)</span>
          </div>
          <div className="flex justify-between">
            <span>Padrão de endereço</span>
            <span className="font-mono font-medium text-slate-800">RUA-A / P01 / NIVEL-1</span>
          </div>
        </div>
      </aside>
    );
  }

  const handlePutawaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSku = sku.trim().toUpperCase();
    const cleanName = name.trim();
    const qtyNum = Number(quantity);

    if (!cleanSku) {
      setError('Informe o código SKU do produto.');
      return;
    }
    if (!cleanName) {
      setError('Informe o nome/descrição do produto.');
      return;
    }
    if (!Number.isFinite(qtyNum) || qtyNum <= 0) {
      setError('A quantidade deve ser maior que zero.');
      return;
    }

    onPutaway(slot.id, {
      sku: cleanSku,
      name: cleanName,
      quantity: Math.floor(qtyNum),
      unit: unit.trim() || 'un',
    });
    setSku('');
    setName('');
    setQuantity('1');
    setError(null);
  };

  const handlePickingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slot.item) return;
    const qtyNum = Number(pickQty);

    if (!Number.isFinite(qtyNum) || qtyNum <= 0) {
      setError('Informe uma quantidade válida para retirada.');
      return;
    }
    if (qtyNum > slot.item.quantity) {
      setError(`Saldo insuficiente. Disponível: ${slot.item.quantity}.`);
      return;
    }

    onPicking(slot.id, Math.floor(qtyNum), pickNote.trim() || undefined);
    setError(null);
  };

  const handleBlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBlockSlot(slot.id, blockReason.trim() || 'Bloqueio operacional');
    setShowBlockForm(false);
    setBlockReason('');
  };

  return (
    <aside className="bg-white border border-slate-200 rounded-xl p-5 sticky top-20 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <span className="text-xs font-medium text-slate-500">Endereço selecionado</span>
          <h2 className="mt-0.5 text-base font-bold font-mono text-slate-900 tracking-tight">
            {slot.address}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Rua {slot.aisle} · Módulo {slot.module} · {LEVEL_LABELS[slot.level]}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
          aria-label="Fechar inspetor"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Status Row */}
      <div className="flex items-center justify-between text-xs py-1">
        <span className="text-slate-500">Status da posição</span>
        {slot.status === 'LIVRE' && (
          <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Livre
          </span>
        )}
        {slot.status === 'OCUPADO' && (
          <span className="inline-flex items-center gap-1.5 font-semibold text-blue-700">
            <ArrowDownToLine className="h-3.5 w-3.5" />
            Ocupado
          </span>
        )}
        {slot.status === 'INDISPONIVEL' && (
          <span className="inline-flex items-center gap-1.5 font-semibold text-rose-700">
            <Lock className="h-3.5 w-3.5" />
            Indisponível
          </span>
        )}
      </div>

      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
          {error}
        </div>
      )}

      {/* LIVRE: Inline Putaway + Option to Block */}
      {slot.status === 'LIVRE' && (
        <div className="space-y-4">
          <form onSubmit={handlePutawaySubmit} className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-800">
              Endereçar Mercadoria (Putaway)
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Código / SKU
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Ex: SKU-1050"
                className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Nome do Produto
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Caixa Papelão 40x30"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Quantidade
                </label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Unidade
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-blue-600"
                >
                  <option value="un">un</option>
                  <option value="cx">cx</option>
                  <option value="plt">plt</option>
                  <option value="rl">rl</option>
                  <option value="gl">gl</option>
                  <option value="kg">kg</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
            >
              <ArrowDownToLine className="h-3.5 w-3.5" />
              <span>Confirmar Entrada nesta Posição</span>
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100">
            {!showBlockForm ? (
              <button
                type="button"
                onClick={() => setShowBlockForm(true)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Lock className="h-3.5 w-3.5 text-slate-500" />
                <span>Marcar como Indisponível</span>
              </button>
            ) : (
              <form onSubmit={handleBlockSubmit} className="space-y-2">
                <input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Motivo (ex: Manutenção na longarina)"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-rose-500"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
                  >
                    Confirmar Bloqueio
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBlockForm(false)}
                    className="px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* OCUPADO: Product Details + Picking Form */}
      {slot.status === 'OCUPADO' && slot.item && (
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs font-bold text-blue-700">
                {slot.item.sku}
              </span>
              <span className="font-mono text-xs tabular-nums font-bold text-slate-900">
                {slot.item.quantity} {slot.item.unit || 'un'}
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-900 leading-snug">
              {slot.item.name}
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              Entrada: {formatDateTimeBr(slot.item.storedAt)}
            </p>
          </div>

          <form onSubmit={handlePickingSubmit} className="space-y-3 pt-1">
            <h3 className="text-xs font-semibold text-slate-800">
              Saída de Mercadoria (Picking)
            </h3>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-600">
                  Quantidade a retirar
                </label>
                <button
                  type="button"
                  onClick={() => setPickQty(String(slot.item?.quantity ?? 1))}
                  className="text-[11px] font-medium text-blue-700 hover:underline"
                >
                  Selecionar total ({slot.item.quantity})
                </button>
              </div>
              <input
                type="number"
                min={1}
                max={slot.item.quantity}
                step={1}
                value={pickQty}
                onChange={(e) => setPickQty(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Observação / Pedido (opcional)
              </label>
              <input
                type="text"
                value={pickNote}
                onChange={(e) => setPickNote(e.target.value)}
                placeholder="Ex: Pedido #4821"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="submit"
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ArrowUpFromLine className="h-3.5 w-3.5" />
                <span>Registrar Baixa</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!slot.item) return;
                  onPicking(slot.id, slot.item.quantity, pickNote.trim() || 'Baixa total');
                }}
                className="px-3 py-2.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors"
              >
                Esvaziar Posição
              </button>
            </div>
          </form>
        </div>
      )}

      {/* INDISPONIVEL: Reason + Unlock Action */}
      {slot.status === 'INDISPONIVEL' && (
        <div className="space-y-4">
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-3.5 space-y-1">
            <span className="text-xs font-semibold text-rose-900">
              Posição bloqueada para uso
            </span>
            <p className="text-xs text-rose-800">
              {slot.blockReason || 'Sem motivo registrado.'}
            </p>
            <p className="text-[11px] font-mono text-rose-700/80 pt-1">
              Atualizado: {formatDateTimeBr(slot.updatedAt)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onUnblockSlot(slot.id)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors"
          >
            <Unlock className="h-3.5 w-3.5" />
            <span>Liberar Posição (Tornar Livre)</span>
          </button>
        </div>
      )}
    </aside>
  );
}
