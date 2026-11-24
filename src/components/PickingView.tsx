import React, { useMemo, useState } from 'react';
import { ArrowUpFromLine, CheckCircle2, MapPin, Search } from 'lucide-react';
import { WarehouseSlot } from '../types/wms';
import { formatDateTimeBr, slotMatchesQuery } from '../utils/warehouse';

interface PickingViewProps {
  slots: WarehouseSlot[];
  onPicking: (slotId: string, quantityToPick: number, note?: string) => void;
  onLocateOnMap?: (slotId: string) => void;
}

export function PickingView({ slots, onPicking, onLocateOnMap }: PickingViewProps) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pickQty, setPickQty] = useState('1');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [lastPickMessage, setLastPickMessage] = useState<string | null>(null);

  const occupiedSlots = useMemo(
    () =>
      slots
        .filter((s) => s.status === 'OCUPADO' && s.item && slotMatchesQuery(s, query))
        .sort((a, b) => a.id.localeCompare(b.id)),
    [slots, query]
  );

  const selectedSlot = useMemo(
    () => slots.find((s) => s.id === selectedId && s.status === 'OCUPADO') ?? null,
    [slots, selectedId]
  );

  const handleSelectSlot = (slot: WarehouseSlot) => {
    setSelectedId(slot.id);
    setPickQty(String(slot.item?.quantity ?? 1));
    setError(null);
    setLastPickMessage(null);
  };

  const handleConfirmPicking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !selectedSlot.item) return;

    const qtyNum = Number(pickQty);
    if (!Number.isFinite(qtyNum) || qtyNum <= 0) {
      setError('Informe uma quantidade válida para saída.');
      return;
    }
    if (qtyNum > selectedSlot.item.quantity) {
      setError(`Quantidade excede o saldo atual (${selectedSlot.item.quantity}).`);
      return;
    }

    const intQty = Math.floor(qtyNum);
    const isTotal = intQty === selectedSlot.item.quantity;
    const skuLabel = selectedSlot.item.sku;
    const addrLabel = selectedSlot.address;

    onPicking(selectedSlot.id, intQty, note.trim() || undefined);

    setLastPickMessage(
      isTotal
        ? `Baixa total de ${intQty} ${selectedSlot.item.unit || 'un'} (${skuLabel}) em ${addrLabel}. Posição liberada.`
        : `Retirada parcial de ${intQty} ${selectedSlot.item.unit || 'un'} (${skuLabel}) em ${addrLabel}.`
    );
    setError(null);
    setNote('');
    if (isTotal) {
      setSelectedId(null);
    } else {
      setPickQty(String(selectedSlot.item.quantity - intQty));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Occupied Positions List */}
      <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Saída de Mercadorias (Picking)
            </h2>
            <p className="text-xs text-slate-500">
              Selecione uma posição ocupada para registrar retirada parcial ou baixa total.
            </p>
          </div>
          <span className="font-mono text-xs tabular-nums text-blue-700 font-semibold whitespace-nowrap">
            {occupiedSlots.length} ocupadas
          </span>
        </div>

        <div className="relative">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filtrar por SKU, nome do produto ou endereço..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-blue-600"
          />
        </div>

        {lastPickMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-900">
            <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
            <span>{lastPickMessage}</span>
          </div>
        )}

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg max-h-[460px] overflow-y-auto">
          {occupiedSlots.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">
              Nenhuma posição ocupada encontrada com os filtros atuais.
            </div>
          ) : (
            occupiedSlots.map((slot) => {
              const isSelected = slot.id === selectedId;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => handleSelectSlot(slot)}
                  className={`w-full text-left px-4 py-3 transition-colors flex items-center justify-between gap-3 ${
                    isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-slate-900">
                        {slot.address}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="font-mono font-semibold text-blue-700">
                        {slot.item?.sku}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm font-medium text-slate-800 truncate">
                      {slot.item?.name}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-sm font-bold tabular-nums text-slate-900">
                      {slot.item?.quantity} {slot.item?.unit || 'un'}
                    </span>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {slot.item ? formatDateTimeBr(slot.item.storedAt) : ''}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Picking Confirmation Panel */}
      <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 sticky top-20">
        {!selectedSlot || !selectedSlot.item ? (
          <div className="py-8 text-center space-y-2">
            <ArrowUpFromLine className="h-6 w-6 text-slate-300 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-800">
              Nenhuma posição selecionada
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Clique em um item da lista à esquerda para informar a quantidade a retirar e dar baixa no estoque.
            </p>
          </div>
        ) : (
          <form onSubmit={handleConfirmPicking} className="space-y-4">
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs text-slate-500">Baixa de estoque em</span>
                <h3 className="font-mono text-base font-bold text-slate-900">
                  {selectedSlot.address}
                </h3>
              </div>
              {onLocateOnMap && (
                <button
                  type="button"
                  onClick={() => onLocateOnMap(selectedSlot.id)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline whitespace-nowrap"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Mapa</span>
                </button>
              )}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-mono font-bold text-blue-700">
                  {selectedSlot.item.sku}
                </span>
                <span className="font-mono font-bold tabular-nums text-slate-900">
                  Saldo: {selectedSlot.item.quantity} {selectedSlot.item.unit || 'un'}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-900">
                {selectedSlot.item.name}
              </p>
            </div>

            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
                {error}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-700">
                  Quantidade a retirar
                </label>
                <button
                  type="button"
                  onClick={() => setPickQty(String(selectedSlot.item?.quantity ?? 1))}
                  className="text-xs font-medium text-blue-700 hover:underline"
                >
                  Retirar tudo ({selectedSlot.item.quantity})
                </button>
              </div>
              <input
                type="number"
                min={1}
                max={selectedSlot.item.quantity}
                step={1}
                value={pickQty}
                onChange={(e) => setPickQty(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Pedido / Destino (opcional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ex: Ordem de Separação #1092"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowUpFromLine className="h-4 w-4" />
              <span>Confirmar Saída (Picking)</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
