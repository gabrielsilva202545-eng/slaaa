import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDownToLine, Menu } from 'lucide-react';
import { DashboardStats } from './components/DashboardStats';
import { HistoryView } from './components/HistoryView';
import { InventoryTableView } from './components/InventoryTableView';
import { PickingView } from './components/PickingView';
import { PutawayView } from './components/PutawayView';
import { Sidebar } from './components/Sidebar';
import { SlotInspector } from './components/SlotInspector';
import { WarehouseMap } from './components/WarehouseMap';
import {
  clearAllWarehouseData,
  loadWmsState,
  resetToDemoData,
  saveWmsState,
} from './services/wmsStorage';
import { ActiveTab, AisleId, MovementRecord, SlotStatus, WarehouseSlot } from './types/wms';
import { calculateWarehouseStats } from './utils/warehouse';

const TAB_TITLES: Record<ActiveTab, string> = {
  MAPA: 'Armazém Central / Mapa de Posições',
  PUTAWAY: 'Armazém Central / Entrada de Mercadorias (Putaway)',
  PICKING: 'Armazém Central / Saída de Mercadorias (Picking)',
  INVENTARIO: 'Armazém Central / Consulta e Busca de Estoque',
  HISTORICO: 'Armazém Central / Histórico de Movimentações',
};

export default function App() {
  const [initialState] = useState(() => loadWmsState());
  const [slots, setSlots] = useState<WarehouseSlot[]>(initialState.slots);
  const [movements, setMovements] = useState<MovementRecord[]>(initialState.movements);

  const [activeTab, setActiveTab] = useState<ActiveTab>('MAPA');
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>('A-P01-N1');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<SlotStatus | 'ALL'>('ALL');
  const [aisleFilter, setAisleFilter] = useState<AisleId | 'ALL'>('ALL');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    saveWmsState(slots, movements);
  }, [slots, movements]);

  const stats = useMemo(() => calculateWarehouseStats(slots), [slots]);

  const selectedSlot = useMemo(
    () => slots.find((s) => s.id === selectedSlotId) ?? null,
    [slots, selectedSlotId]
  );

  const handlePutaway = (
    slotId: string,
    payload: { sku: string; name: string; quantity: number; unit: string }
  ) => {
    const now = new Date().toISOString();
    let targetAddress = '';

    setSlots((prev) =>
      prev.map((slot) => {
        if (slot.id !== slotId || slot.status !== 'LIVRE') return slot;
        targetAddress = slot.address;
        return {
          ...slot,
          status: 'OCUPADO',
          updatedAt: now,
          item: {
            sku: payload.sku,
            name: payload.name,
            quantity: payload.quantity,
            unit: payload.unit,
            storedAt: now,
          },
        };
      })
    );

    if (targetAddress) {
      const record: MovementRecord = {
        id: `mov-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: 'ENTRADA',
        slotId,
        address: targetAddress,
        sku: payload.sku,
        productName: payload.name,
        quantity: payload.quantity,
        remainingQuantity: payload.quantity,
        timestamp: now,
      };
      setMovements((prev) => [record, ...prev]);
    }
  };

  const handlePicking = (slotId: string, quantityToPick: number, note?: string) => {
    const now = new Date().toISOString();
    let recordToAdd: MovementRecord | null = null;

    setSlots((prev) =>
      prev.map((slot) => {
        if (slot.id !== slotId || slot.status !== 'OCUPADO' || !slot.item) {
          return slot;
        }
        const remaining = slot.item.quantity - quantityToPick;
        recordToAdd = {
          id: `mov-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          type: 'SAIDA',
          slotId,
          address: slot.address,
          sku: slot.item.sku,
          productName: slot.item.name,
          quantity: quantityToPick,
          remainingQuantity: Math.max(0, remaining),
          note,
          timestamp: now,
        };

        if (remaining <= 0) {
          return {
            ...slot,
            status: 'LIVRE',
            item: null,
            updatedAt: now,
          };
        }

        return {
          ...slot,
          updatedAt: now,
          item: {
            ...slot.item,
            quantity: remaining,
          },
        };
      })
    );

    if (recordToAdd) {
      setMovements((prev) => [recordToAdd!, ...prev]);
    }
  };

  const handleBlockSlot = (slotId: string, reason: string) => {
    const now = new Date().toISOString();
    let targetAddress = '';

    setSlots((prev) =>
      prev.map((slot) => {
        if (slot.id !== slotId || slot.status !== 'LIVRE') return slot;
        targetAddress = slot.address;
        return {
          ...slot,
          status: 'INDISPONIVEL',
          blockReason: reason,
          updatedAt: now,
        };
      })
    );

    if (targetAddress) {
      setMovements((prev) => [
        {
          id: `mov-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          type: 'BLOQUEIO',
          slotId,
          address: targetAddress,
          note: reason,
          timestamp: now,
        },
        ...prev,
      ]);
    }
  };

  const handleUnblockSlot = (slotId: string) => {
    const now = new Date().toISOString();
    let targetAddress = '';

    setSlots((prev) =>
      prev.map((slot) => {
        if (slot.id !== slotId || slot.status !== 'INDISPONIVEL') return slot;
        targetAddress = slot.address;
        return {
          ...slot,
          status: 'LIVRE',
          blockReason: undefined,
          updatedAt: now,
        };
      })
    );

    if (targetAddress) {
      setMovements((prev) => [
        {
          id: `mov-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          type: 'DESBLOQUEIO',
          slotId,
          address: targetAddress,
          note: 'Posição liberada para operação',
          timestamp: now,
        },
        ...prev,
      ]);
    }
  };

  const handleResetDemo = () => {
    const seeded = resetToDemoData();
    setSlots(seeded.slots);
    setMovements(seeded.movements);
    setSelectedSlotId('A-P01-N1');
  };

  const handleClearAll = () => {
    const cleared = clearAllWarehouseData();
    setSlots(cleared.slots);
    setMovements(cleared.movements);
    setSelectedSlotId('A-P01-N1');
  };

  const handleLocateOnMap = (slotId: string) => {
    setSelectedSlotId(slotId);
    setAisleFilter('ALL');
    setStatusFilter('ALL');
    setActiveTab('MAPA');
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onResetDemo={handleResetDemo}
        onClearAll={handleClearAll}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        occupiedCount={stats.occupiedSlots}
        freeCount={stats.freeSlots}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar Contract: Breadcrumb on left, 1 primary CTA on right */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-md focus-visible:outline-2 focus-visible:outline-blue-600"
              aria-label="Abrir navegação"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-sm font-semibold text-slate-800 truncate">
              {TAB_TITLES[activeTab]}
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('PUTAWAY')}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            <ArrowDownToLine className="h-3.5 w-3.5" />
            <span>Nova Entrada</span>
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6 max-w-[1440px] w-full mx-auto space-y-6">
          <DashboardStats
            stats={stats}
            selectedAisleFilter={aisleFilter}
            onSelectAisleFilter={(aisle) => {
              setAisleFilter(aisle);
              if (activeTab !== 'MAPA') setActiveTab('MAPA');
            }}
          />

          {activeTab === 'MAPA' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 min-w-0">
                <WarehouseMap
                  slots={slots}
                  selectedSlotId={selectedSlotId}
                  onSelectSlot={setSelectedSlotId}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                  aisleFilter={aisleFilter}
                  onAisleFilterChange={setAisleFilter}
                />
              </div>
              <div className="lg:col-span-4 min-w-0">
                <SlotInspector
                  slot={selectedSlot}
                  onClose={() => setSelectedSlotId(null)}
                  onPutaway={handlePutaway}
                  onPicking={handlePicking}
                  onBlockSlot={handleBlockSlot}
                  onUnblockSlot={handleUnblockSlot}
                />
              </div>
            </div>
          )}

          {activeTab === 'PUTAWAY' && (
            <PutawayView
              slots={slots}
              onPutaway={handlePutaway}
              onLocateOnMap={handleLocateOnMap}
            />
          )}

          {activeTab === 'PICKING' && (
            <PickingView
              slots={slots}
              onPicking={handlePicking}
              onLocateOnMap={handleLocateOnMap}
            />
          )}

          {activeTab === 'INVENTARIO' && (
            <InventoryTableView
              slots={slots}
              onLocateOnMap={handleLocateOnMap}
            />
          )}

          {activeTab === 'HISTORICO' && (
            <HistoryView
              movements={movements}
              onLocateOnMap={handleLocateOnMap}
            />
          )}
        </main>
      </div>
    </div>
  );
}
