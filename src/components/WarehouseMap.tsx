import React from 'react';
import { Check, Lock, Package, Search, X } from 'lucide-react';
import { AisleId, SlotStatus, WarehouseSlot } from '../types/wms';
import { AISLES, LEVELS_TOP_DOWN, MODULES, buildSlotId, slotMatchesQuery } from '../utils/warehouse';

interface WarehouseMapProps {
  slots: WarehouseSlot[];
  selectedSlotId: string | null;
  onSelectSlot: (slotId: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: SlotStatus | 'ALL';
  onStatusFilterChange: (status: SlotStatus | 'ALL') => void;
  aisleFilter: AisleId | 'ALL';
  onAisleFilterChange: (aisle: AisleId | 'ALL') => void;
}

export function WarehouseMap({
  slots,
  selectedSlotId,
  onSelectSlot,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  aisleFilter,
  onAisleFilterChange,
}: WarehouseMapProps) {
  const slotMap = new Map(slots.map((s) => [s.id, s]));
  const hasSearch = searchQuery.trim().length > 0;

  const visibleAisles = aisleFilter === 'ALL' ? AISLES : [aisleFilter];

  const matchingSlots = slots.filter(
    (s) =>
      (statusFilter === 'ALL' || s.status === statusFilter) &&
      (aisleFilter === 'ALL' || s.aisle === aisleFilter) &&
      slotMatchesQuery(s, searchQuery)
  );

  return (
    <div className="space-y-4">
      {/* Search, Filter & Legend Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar SKU, produto ou endereço (ex: SKU-5001, Parafuso, RUA-A, P02, N3)..."
              className="w-full pl-9 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
            />
            {hasSearch && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded"
                aria-label="Limpar busca"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0 overflow-x-auto">
            {(
              [
                { id: 'ALL', label: 'Todas' },
                { id: 'LIVRE', label: 'Livres' },
                { id: 'OCUPADO', label: 'Ocupadas' },
                { id: 'INDISPONIVEL', label: 'Indisponíveis' },
              ] as const
            ).map((opt) => {
              const active = statusFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onStatusFilterChange(opt.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Accessible Status Legend + Active Filter Readout */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded border border-emerald-300 bg-emerald-50 text-emerald-700">
                <Check className="h-2.5 w-2.5" />
              </span>
              <span>Livre</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded border border-blue-800 bg-blue-700 text-white">
                <Package className="h-2.5 w-2.5" />
              </span>
              <span>Ocupado</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded border border-rose-300 bg-rose-50 text-rose-700 wms-unavailable-hatch">
                <Lock className="h-2.5 w-2.5" />
              </span>
              <span>Indisponível</span>
            </span>
            <span className="text-slate-400 hidden sm:inline">·</span>
            <span className="text-slate-500 hidden sm:inline">
              N5 = Topo / N1 = Piso
            </span>
          </div>

          <div className="text-xs text-slate-500 font-mono tabular-nums">
            {hasSearch || statusFilter !== 'ALL' || aisleFilter !== 'ALL' ? (
              <span>
                {matchingSlots.length} {matchingSlots.length === 1 ? 'posição encontrada' : 'posições encontradas'}
              </span>
            ) : (
              <span>150 posições mapeadas</span>
            )}
          </div>
        </div>
      </div>

      {/* Physical Rack Elevation Grid: 6 Aisles (Rua A-F) × 5 Modules (P01-P05) × 5 Levels (N5-N1) */}
      <div
        className={`grid gap-5 ${
          visibleAisles.length === 1 ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-2'
        }`}
      >
        {visibleAisles.map((aisle) => {
          const aisleSlots = slots.filter((s) => s.aisle === aisle);
          const occupiedInAisle = aisleSlots.filter((s) => s.status === 'OCUPADO').length;
          const freeInAisle = aisleSlots.filter((s) => s.status === 'LIVRE').length;

          return (
            <div
              key={aisle}
              className="bg-white border border-slate-200 rounded-xl p-4"
            >
              {/* Aisle Header */}
              <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
                <div className="flex items-baseline gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      onAisleFilterChange(aisleFilter === aisle ? 'ALL' : aisle)
                    }
                    className="text-sm font-bold text-slate-900 hover:text-blue-700 transition-colors"
                    title={
                      aisleFilter === aisle
                        ? 'Clique para exibir todas as ruas'
                        : `Focar apenas na Rua ${aisle}`
                    }
                  >
                    Rua {aisle}
                  </button>
                  <span className="text-xs text-slate-500">
                    Módulos P01–P05
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-slate-600">
                  <span className="text-emerald-700">{freeInAisle} liv.</span>
                  <span className="text-slate-300">/</span>
                  <span className="text-blue-700">{occupiedInAisle} ocup.</span>
                </div>
              </div>

              {/* Column Headers: Level Axis + P01..P05 */}
              <div className="grid grid-cols-[32px_repeat(5,minmax(0,1fr))] gap-1.5 mb-1.5">
                <div className="text-[11px] font-mono text-slate-400 text-center self-end pb-0.5">
                  Nív
                </div>
                {MODULES.map((mod) => (
                  <div
                    key={mod}
                    className="text-center text-xs font-mono font-semibold text-slate-600 py-0.5"
                  >
                    {mod}
                  </div>
                ))}
              </div>

              {/* 5 Levels (Top N5 -> Bottom N1 Piso) */}
              <div className="space-y-1.5">
                {LEVELS_TOP_DOWN.map((level) => (
                  <div
                    key={level}
                    className="grid grid-cols-[32px_repeat(5,minmax(0,1fr))] gap-1.5 items-stretch"
                  >
                    <div
                      className="flex items-center justify-center text-[11px] font-mono font-medium text-slate-500 bg-slate-50 rounded border border-slate-200/70"
                      title={level === 1 ? 'Nível 1 (Piso)' : level === 5 ? 'Nível 5 (Topo)' : `Nível ${level}`}
                    >
                      N{level}
                    </div>

                    {MODULES.map((mod) => {
                      const slotId = buildSlotId(aisle, mod, level);
                      const slot = slotMap.get(slotId);
                      if (!slot) return null;

                      const isSelected = selectedSlotId === slot.id;
                      const matchesFilter =
                        statusFilter === 'ALL' || slot.status === statusFilter;
                      const matchesQuery = slotMatchesQuery(slot, searchQuery);
                      const isDimmed =
                        !matchesFilter || (hasSearch && !matchesQuery);
                      const isSearchHit = hasSearch && matchesQuery && matchesFilter;

                      let cellClasses = '';
                      if (slot.status === 'LIVRE') {
                        cellClasses =
                          'bg-emerald-50/75 border-emerald-300 text-emerald-900 hover:bg-emerald-100/90 hover:border-emerald-400';
                      } else if (slot.status === 'OCUPADO') {
                        cellClasses =
                          'bg-blue-700 border-blue-800 text-white hover:bg-blue-800';
                      } else {
                        cellClasses =
                          'bg-rose-50 border-rose-300 text-rose-800 wms-unavailable-hatch hover:border-rose-400';
                      }

                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => onSelectSlot(slot.id)}
                          aria-label={`${slot.address} — ${slot.status}${
                            slot.item ? ` — ${slot.item.sku} ${slot.item.name}` : ''
                          }`}
                          title={
                            slot.status === 'OCUPADO' && slot.item
                              ? `${slot.address}\n${slot.item.sku} · ${slot.item.name}\nQtd: ${slot.item.quantity} ${slot.item.unit || 'un'}`
                              : slot.status === 'INDISPONIVEL'
                              ? `${slot.address}\nIndisponível${slot.blockReason ? `: ${slot.blockReason}` : ''}`
                              : `${slot.address}\nLivre para endereçamento`
                          }
                          className={`relative min-h-[44px] px-1 py-1 rounded-md border text-left transition-all duration-150 flex flex-col justify-between overflow-hidden focus-visible:outline-2 focus-visible:outline-blue-600 ${cellClasses} ${
                            isSelected
                              ? 'ring-2 ring-slate-900 ring-offset-1 z-10'
                              : isSearchHit
                              ? 'ring-2 ring-amber-500 ring-offset-1 z-10'
                              : ''
                          } ${isDimmed ? 'opacity-25' : 'opacity-100'}`}
                        >
                          {slot.status === 'LIVRE' && (
                            <>
                              <span className="text-[10px] font-mono leading-none opacity-75">
                                {mod}·N{level}
                              </span>
                              <span className="text-[11px] font-semibold leading-none">
                                Livre
                              </span>
                            </>
                          )}

                          {slot.status === 'OCUPADO' && slot.item && (
                            <>
                              <span className="text-[10px] font-mono font-semibold leading-tight truncate w-full">
                                {slot.item.sku}
                              </span>
                              <span className="text-[10px] font-mono tabular-nums opacity-90 leading-none">
                                {slot.item.quantity} {slot.item.unit || 'un'}
                              </span>
                            </>
                          )}

                          {slot.status === 'INDISPONIVEL' && (
                            <>
                              <span className="text-[10px] font-mono leading-none opacity-75">
                                {mod}·N{level}
                              </span>
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold leading-none">
                                <Lock className="h-2.5 w-2.5 shrink-0" />
                                <span className="truncate">Bloq.</span>
                              </span>
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
