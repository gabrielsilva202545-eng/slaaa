import React from 'react';
import { AisleId, WarehouseStats } from '../types/wms';

interface DashboardStatsProps {
  stats: WarehouseStats;
  selectedAisleFilter: AisleId | 'ALL';
  onSelectAisleFilter: (aisle: AisleId | 'ALL') => void;
}

export function DashboardStats({
  stats,
  selectedAisleFilter,
  onSelectAisleFilter,
}: DashboardStatsProps) {
  return (
    <section aria-label="Indicadores de ocupação" className="space-y-4">
      {/* 4-Column KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs font-medium text-slate-500">Taxa de Ocupação Geral</span>
            <span className="font-mono text-xs tabular-nums text-slate-400">
              {stats.occupiedSlots}/{stats.totalSlots}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {stats.occupancyRate.toFixed(1)}%
            </span>
            <span className="text-xs text-slate-500">
              {stats.distinctSkus} SKUs · {stats.totalUnitsStored.toLocaleString('pt-BR')} un.
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-700 transition-all duration-200"
              style={{ width: `${Math.min(100, stats.occupancyRate)}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs font-medium text-slate-500">Posições Livres</span>
            <span className="text-xs font-medium text-emerald-700">Disponíveis</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-700 font-mono tabular-nums">
              {stats.freeSlots}
            </span>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              de {stats.totalSlots} ({((stats.freeSlots / stats.totalSlots) * 100).toFixed(1)}%)
            </span>
          </div>
          <p className="mt-2.5 text-xs text-slate-500">Prontas para recebimento</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs font-medium text-slate-500">Posições Ocupadas</span>
            <span className="text-xs font-medium text-blue-700">Com estoque</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-blue-700 font-mono tabular-nums">
              {stats.occupiedSlots}
            </span>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              de {stats.totalSlots} ({((stats.occupiedSlots / stats.totalSlots) * 100).toFixed(1)}%)
            </span>
          </div>
          <p className="mt-2.5 text-xs text-slate-500">Paletes endereçados no porta-paletes</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs font-medium text-slate-500">Posições Indisponíveis</span>
            <span className="text-xs font-medium text-rose-700">Bloqueadas</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-rose-700 font-mono tabular-nums">
              {stats.unavailableSlots}
            </span>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              de {stats.totalSlots} ({((stats.unavailableSlots / stats.totalSlots) * 100).toFixed(1)}%)
            </span>
          </div>
          <p className="mt-2.5 text-xs text-slate-500">Em manutenção ou restrição física</p>
        </div>
      </div>

      {/* Compact Aisle Breakdown Bar */}
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <span className="text-xs font-semibold text-slate-700">
            Ocupação por Rua (25 posições/rua)
          </span>
          {selectedAisleFilter !== 'ALL' && (
            <button
              type="button"
              onClick={() => onSelectAisleFilter('ALL')}
              className="text-xs font-medium text-blue-700 hover:underline whitespace-nowrap"
            >
              Mostrar todas as 6 ruas
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {stats.byAisle.map((aisleStat) => {
            const isSelected = selectedAisleFilter === aisleStat.aisle;
            return (
              <button
                key={aisleStat.aisle}
                type="button"
                onClick={() =>
                  onSelectAisleFilter(isSelected ? 'ALL' : aisleStat.aisle)
                }
                className={`text-left px-3 py-2 rounded-lg border transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 ${
                  isSelected
                    ? 'bg-blue-50 border-blue-400'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-slate-900 whitespace-nowrap">
                    Rua {aisleStat.aisle}
                  </span>
                  <span className="font-mono text-xs tabular-nums text-slate-600">
                    {aisleStat.occupied}/{aisleStat.total}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-blue-700"
                    style={{ width: `${(aisleStat.occupied / aisleStat.total) * 100}%` }}
                  />
                  <div
                    className="h-full bg-rose-400"
                    style={{ width: `${(aisleStat.unavailable / aisleStat.total) * 100}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
