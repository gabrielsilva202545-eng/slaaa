import React, { useMemo, useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, Lock, Unlock } from 'lucide-react';
import { MovementRecord, MovementType } from '../types/wms';
import { formatDateTimeBr } from '../utils/warehouse';

interface HistoryViewProps {
  movements: MovementRecord[];
  onLocateOnMap: (slotId: string) => void;
}

export function HistoryView({ movements, onLocateOnMap }: HistoryViewProps) {
  const [filterType, setFilterType] = useState<MovementType | 'ALL'>('ALL');

  const filtered = useMemo(() => {
    if (filterType === 'ALL') return movements;
    return movements.filter((m) => m.type === filterType);
  }, [movements, filterType]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Histórico de Movimentações
          </h2>
          <p className="text-xs text-slate-500">
            Registro local de entradas (Putaway), saídas (Picking) e bloqueios estruturais.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          {(
            [
              { id: 'ALL', label: 'Todas' },
              { id: 'ENTRADA', label: 'Entradas' },
              { id: 'SAIDA', label: 'Saídas' },
              { id: 'BLOQUEIO', label: 'Bloqueios' },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setFilterType(opt.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                filterType === opt.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
              <th className="py-3 px-4 whitespace-nowrap">Data / Hora</th>
              <th className="py-3 px-4 whitespace-nowrap">Operação</th>
              <th className="py-3 px-4 whitespace-nowrap">Endereço</th>
              <th className="py-3 px-4 whitespace-nowrap">SKU</th>
              <th className="py-3 px-4">Produto / Detalhe</th>
              <th className="py-3 px-4 text-right whitespace-nowrap">Qtd.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  Nenhuma movimentação registrada ainda.
                </td>
              </tr>
            ) : (
              filtered.map((mov) => (
                <tr key={mov.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                    {formatDateTimeBr(mov.timestamp)}
                  </td>
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    {mov.type === 'ENTRADA' && (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                        <ArrowDownToLine className="h-3.5 w-3.5" />
                        Entrada
                      </span>
                    )}
                    {mov.type === 'SAIDA' && (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-blue-700">
                        <ArrowUpFromLine className="h-3.5 w-3.5" />
                        Saída
                      </span>
                    )}
                    {mov.type === 'BLOQUEIO' && (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-rose-700">
                        <Lock className="h-3.5 w-3.5" />
                        Bloqueio
                      </span>
                    )}
                    {mov.type === 'DESBLOQUEIO' && (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                        <Unlock className="h-3.5 w-3.5" />
                        Liberação
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onLocateOnMap(mov.slotId)}
                      className="font-mono font-semibold text-slate-900 hover:text-blue-700 hover:underline"
                    >
                      {mov.address}
                    </button>
                  </td>
                  <td className="py-2.5 px-4 font-mono font-semibold text-slate-800 whitespace-nowrap">
                    {mov.sku ?? '—'}
                  </td>
                  <td className="py-2.5 px-4 text-slate-700">
                    <span>{mov.productName ?? mov.note ?? '—'}</span>
                    {mov.productName && mov.note && (
                      <span className="text-slate-400"> · {mov.note}</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold tabular-nums text-slate-900 whitespace-nowrap">
                    {typeof mov.quantity === 'number'
                      ? mov.type === 'ENTRADA'
                        ? `+${mov.quantity}`
                        : `-${mov.quantity}`
                      : '—'}
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
