import React, { useState } from 'react';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  LayoutGrid,
  PackageSearch,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react';
import { ActiveTab } from '../types/wms';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onResetDemo: () => void;
  onClearAll: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  occupiedCount: number;
  freeCount: number;
}

const NAV_ITEMS: Array<{
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'MAPA', label: 'Mapa do Armazém', icon: LayoutGrid },
  { id: 'PUTAWAY', label: 'Entrada (Putaway)', icon: ArrowDownToLine },
  { id: 'PICKING', label: 'Saída (Picking)', icon: ArrowUpFromLine },
  { id: 'INVENTARIO', label: 'Inventário e Busca', icon: PackageSearch },
  { id: 'HISTORICO', label: 'Histórico', icon: History },
];

export function Sidebar({
  activeTab,
  onSelectTab,
  onResetDemo,
  onClearAll,
  mobileOpen,
  onCloseMobile,
  occupiedCount,
  freeCount,
}: SidebarProps) {
  const [confirmClear, setConfirmClear] = useState(false);

  const handleNavClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-white border-r border-slate-200">
      <div className="flex h-16 items-center justify-between px-5 border-b border-slate-200 shrink-0">
        <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
          WMS Estrutura
        </span>
        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden p-2 -mr-2 text-slate-500 hover:text-slate-900 rounded-md focus-visible:outline-2 focus-visible:outline-blue-600"
          aria-label="Fechar menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto" aria-label="Navegação principal">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-blue-600 ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? 'text-blue-700' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </span>
              {item.id === 'PUTAWAY' && (
                <span className="font-mono text-xs tabular-nums text-slate-500 ml-2">
                  {freeCount}
                </span>
              )}
              {item.id === 'PICKING' && (
                <span className="font-mono text-xs tabular-nums text-slate-500 ml-2">
                  {occupiedCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-slate-200 space-y-2 shrink-0">
        <div className="text-xs text-slate-500 flex items-center justify-between pb-1">
          <span>Capacidade física</span>
          <span className="font-mono tabular-nums font-medium text-slate-700">6 × 5 × 5 (150)</span>
        </div>

        <button
          type="button"
          onClick={() => {
            onResetDemo();
            setConfirmClear(false);
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-blue-600"
        >
          <RotateCcw className="h-3.5 w-3.5 text-slate-500 shrink-0" />
          <span>Restaurar Dados de Exemplo</span>
        </button>

        {!confirmClear ? (
          <button
            type="button"
            onClick={() => setConfirmClear(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-lg transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-rose-600"
          >
            <Trash2 className="h-3.5 w-3.5 shrink-0" />
            <span>Zerar Armazém</span>
          </button>
        ) : (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg space-y-2">
            <p className="text-xs text-rose-900 font-medium">
              Liberar todas as 150 posições?
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClearAll();
                  setConfirmClear(false);
                }}
                className="flex-1 px-2.5 py-1.5 text-xs font-medium bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors"
              >
                Confirmar
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="flex-1 px-2.5 py-1.5 text-xs font-medium bg-white text-slate-700 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px]"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-64 max-w-[80vw] h-full shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
