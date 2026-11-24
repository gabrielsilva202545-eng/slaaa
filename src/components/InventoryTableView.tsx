import React, { useMemo, useState } from 'react';
import { Download, MapPin, Search, X } from 'lucide-react';
import { SlotStatus, WarehouseSlot } from '../types/wms';
import { LEVEL_LABELS, formatDateTimeBr, slotMatchesQuery } from '../utils/warehouse';

interface InventoryTableViewProps {
  slots: WarehouseSlot[];
  onLocateOnMap: (slotId: string) => void;
}

export function InventoryTableView({ slots, onLocateOnMap }: InventoryTableViewProps) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<SlotStatus | 'ALL'>('OCUPADO');

  const filteredSlots = useMemo(() => {
    return slots.filter((slot) => {
      if (statusFilter !== 'ALL' && slot.status !== statusFilter) return false;
      return slotMatchesQuery(slot, query);
    });
  }, [slots, statusFilter, query]);

  const handleExportCsv = () => {
    const header = [
      'Endereco',
      'Rua',
      'Modulo',
      'Nivel',
      'Status',
      'SKU',
      'Produto',
      'Quantidade',
      'Unidade',
      'AtualizadoEm',
    ];
    const rows = filteredSlots.map((s) => [
      s.address,
      `Rua ${s.aisle}`,
      s.module,
      `Nivel ${s.level}`,
      s.status,
      s.item?.sku ?? '',
      `"${(s.item?.name ?? s.blockReason ?? '').replace(/"/g, '""')}"`,
      s.item?.quantity ?? 0,
      s.item?.unit ?? '',
      s.updatedAt,
    ]);
    const csvContent = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wms-inventario-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="p-5 border-b border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Consulta e Busca de Estoque
            </h2>
            <p className="text-xs text-slate-500">
              Localize em qual Rua, Módulo e Nível cada SKU ou produto está armazenado.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Exportar CSV</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por SKU, nome do produto, Rua, Módulo ou Nível..."
              className="w-full pl-9 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-blue-600"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
                aria-label="Limpar busca"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0 overflow-x-auto">
            {(
              [
                { id: 'OCUPADO', label: 'Com Estoque' },
                { id: 'LIVRE', label: 'Livres' },
                { id: 'INDISPONIVEL', label: 'Indisponíveis' },
                { id: 'ALL', label: 'Todas (150)' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setStatusFilter(opt.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  statusFilter === opt.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
              <th className="py-3 px-4 whitespace-nowrap">Rua</th>
              <th className="py-3 px-4 whitespace-nowrap">Módulo</th>
              <th className="py-3 px-4 whitespace-nowrap">Nível</th>
              <th className="py-3 px-4 whitespace-nowrap">Status</th>
              <th className="py-3 px-4 whitespace-nowrap">SKU</th>
              <th className="py-3 px-4">Produto / Observação</th>
              <th className="py-3 px-4 text-right whitespace-nowrap">Quantidade</th>
              <th className="py-3 px-4 whitespace-nowrap">Atualização</th>
              <th className="py-3 px-4 text-right whitespace-nowrap">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredSlots.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-500">
                  Nenhuma posição encontrada para os critérios selecionados.
                </td>
              </tr>
            ) : (
              filteredSlots.map((slot) => (
                <tr key={slot.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                    Rua {slot.aisle}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                    {slot.module}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                    {LEVEL_LABELS[slot.level]}
                  </td>
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    {slot.status === 'LIVRE' && (
                      <span className="font-semibold text-emerald-700">Livre</span>
                    )}
                    {slot.status === 'OCUPADO' && (
                      <span className="font-semibold text-blue-700">Ocupado</span>
                    )}
                    {slot.status === 'INDISPONIVEL' && (
                      <span className="font-semibold text-rose-700">Indisponível</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                    {slot.item?.sku ?? '—'}
                  </td>
                  <td className="py-2.5 px-4 text-slate-800 max-w-xs truncate">
                    {slot.item?.name ?? slot.blockReason ?? 'Disponível para putaway'}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold tabular-nums text-slate-900 whitespace-nowrap">
                    {slot.item ? `${slot.item.quantity} ${slot.item.unit || 'un'}` : '—'}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                    {formatDateTimeBr(slot.updatedAt)}
                  </td>
                  <td className="py-2.5 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onLocateOnMap(slot.id)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline"
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      <span>Localizar</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
