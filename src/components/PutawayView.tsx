import React, { useMemo, useState } from 'react';
import { ArrowDownToLine, CheckCircle2, Sparkles } from 'lucide-react';
import { AisleId, LevelNumber, ModuleCode, WarehouseSlot } from '../types/wms';
import {
  AISLES,
  LEVELS_BOTTOM_UP,
  LEVEL_LABELS,
  MODULES,
  buildSlotId,
} from '../utils/warehouse';

interface PutawayViewProps {
  slots: WarehouseSlot[];
  onPutaway: (
    slotId: string,
    payload: { sku: string; name: string; quantity: number; unit: string }
  ) => void;
  onLocateOnMap?: (slotId: string) => void;
}

export function PutawayView({ slots, onPutaway, onLocateOnMap }: PutawayViewProps) {
  const freeSlots = useMemo(
    () => slots.filter((s) => s.status === 'LIVRE'),
    [slots]
  );

  const firstFree = freeSlots[0];
  const [aisle, setAisle] = useState<AisleId>(firstFree?.aisle ?? 'A');
  const [module, setModule] = useState<ModuleCode>(firstFree?.module ?? 'P01');
  const [level, setLevel] = useState<LevelNumber>(firstFree?.level ?? 1);

  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('un');
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    address: string;
    slotId: string;
    sku: string;
  } | null>(null);

  const selectedSlotId = buildSlotId(aisle, module, level);
  const selectedSlot = slots.find((s) => s.id === selectedSlotId);

  const handleSuggestFree = () => {
    // Prefer lower levels first (N1 -> N5) for ergonomic putaway
    const sorted = [...freeSlots].sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      if (a.aisle !== b.aisle) return a.aisle.localeCompare(b.aisle);
      return a.module.localeCompare(b.module);
    });
    const best = sorted[0];
    if (!best) {
      setError('Não há posições livres disponíveis no armazém.');
      return;
    }
    setAisle(best.aisle);
    setModule(best.module);
    setLevel(best.level);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessInfo(null);

    if (!selectedSlot || selectedSlot.status !== 'LIVRE') {
      setError(
        `A posição ${selectedSlot?.address ?? selectedSlotId} não está livre (${selectedSlot?.status}). Escolha um endereço livre.`
      );
      return;
    }

    const cleanSku = sku.trim().toUpperCase();
    const cleanName = name.trim();
    const qtyNum = Number(quantity);

    if (!cleanSku) {
      setError('Informe o código / SKU da mercadoria.');
      return;
    }
    if (!cleanName) {
      setError('Informe o nome do produto.');
      return;
    }
    if (!Number.isFinite(qtyNum) || qtyNum <= 0) {
      setError('Informe uma quantidade válida maior que zero.');
      return;
    }

    onPutaway(selectedSlot.id, {
      sku: cleanSku,
      name: cleanName,
      quantity: Math.floor(qtyNum),
      unit: unit.trim() || 'un',
    });

    setSuccessInfo({
      address: selectedSlot.address,
      slotId: selectedSlot.id,
      sku: cleanSku,
    });
    setSku('');
    setName('');
    setQuantity('1');
    setError(null);

    // Auto-advance selection to next free slot
    const nextFree = freeSlots.find((s) => s.id !== selectedSlot.id);
    if (nextFree) {
      setAisle(nextFree.aisle);
      setModule(nextFree.module);
      setLevel(nextFree.level);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Main Putaway Form */}
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-5"
      >
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Recebimento e Endereçamento (Putaway)
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Cadastre o produto recebido e defina o endereço físico no porta-paletes.
            </p>
          </div>
          <span className="font-mono text-xs tabular-nums text-emerald-700 font-semibold whitespace-nowrap">
            {freeSlots.length} vagas livres
          </span>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
            {error}
          </div>
        )}

        {successInfo && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-emerald-900">
              <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
              <span>
                <strong className="font-mono">{successInfo.sku}</strong> endereçado em{' '}
                <strong className="font-mono">{successInfo.address}</strong>.
              </span>
            </div>
            {onLocateOnMap && (
              <button
                type="button"
                onClick={() => onLocateOnMap(successInfo.slotId)}
                className="text-xs font-semibold text-emerald-800 hover:underline whitespace-nowrap"
              >
                Ver no mapa
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Código / SKU
            </label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="Ex: SKU-4090"
              className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Nome do Produto
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Rolamento Esférico 6205 ZZ"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
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
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Unidade de Medida
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-blue-600"
            >
              <option value="un">Unidades (un)</option>
              <option value="cx">Caixas (cx)</option>
              <option value="plt">Paletes (plt)</option>
              <option value="rl">Rolos (rl)</option>
              <option value="gl">Galões (gl)</option>
              <option value="kg">Quilos (kg)</option>
            </select>
          </div>
        </div>

        {/* Address Selector */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-800">
              Endereço de Destino
            </span>
            <button
              type="button"
              onClick={handleSuggestFree}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 hover:text-blue-800"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Sugerir posição livre (menor nível)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Rua (A–F)
              </label>
              <select
                value={aisle}
                onChange={(e) => setAisle(e.target.value as AisleId)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-blue-600"
              >
                {AISLES.map((a) => {
                  const freeInAisle = slots.filter(
                    (s) => s.aisle === a && s.status === 'LIVRE'
                  ).length;
                  return (
                    <option key={a} value={a}>
                      Rua {a} ({freeInAisle} liv.)
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Módulo (P01–P05)
              </label>
              <select
                value={module}
                onChange={(e) => setModule(e.target.value as ModuleCode)}
                className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-blue-600"
              >
                {MODULES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Nível (1–5)
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(Number(e.target.value) as LevelNumber)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-blue-600"
              >
                {LEVELS_BOTTOM_UP.map((l) => (
                  <option key={l} value={l}>
                    {LEVEL_LABELS[l]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
            <div>
              <span className="text-slate-500">Endereço selecionado: </span>
              <span className="font-mono font-bold text-slate-900">
                {selectedSlot?.address}
              </span>
            </div>
            {selectedSlot?.status === 'LIVRE' ? (
              <span className="font-semibold text-emerald-700">Livre</span>
            ) : selectedSlot?.status === 'OCUPADO' ? (
              <span className="font-semibold text-blue-700">
                Ocupado ({selectedSlot.item?.sku})
              </span>
            ) : (
              <span className="font-semibold text-rose-700">Indisponível</span>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={!selectedSlot || selectedSlot.status !== 'LIVRE'}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          <ArrowDownToLine className="h-4 w-4" />
          <span>Registrar Entrada (Putaway)</span>
        </button>
      </form>

      {/* Quick Picker of Free Positions in Selected Aisle */}
      <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Posições Livres na Rua {aisle}
          </h3>
          <span className="font-mono text-xs tabular-nums text-slate-500">
            Clique para selecionar
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[380px] overflow-y-auto pr-1">
          {slots
            .filter((s) => s.aisle === aisle && s.status === 'LIVRE')
            .map((s) => {
              const isCurrent = s.id === selectedSlotId;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setAisle(s.aisle);
                    setModule(s.module);
                    setLevel(s.level);
                    setError(null);
                  }}
                  className={`px-3 py-2 text-left rounded-lg border text-xs transition-colors ${
                    isCurrent
                      ? 'bg-blue-700 border-blue-800 text-white'
                      : 'bg-emerald-50/70 border-emerald-200 text-emerald-900 hover:bg-emerald-100'
                  }`}
                >
                  <div className="font-mono font-bold">
                    {s.module} · N{s.level}
                  </div>
                  <div
                    className={`text-[11px] ${
                      isCurrent ? 'text-blue-100' : 'text-emerald-700'
                    }`}
                  >
                    {s.level === 1 ? 'Piso' : s.level === 5 ? 'Topo' : `Nível ${s.level}`}
                  </div>
                </button>
              );
            })}
          {slots.filter((s) => s.aisle === aisle && s.status === 'LIVRE').length === 0 && (
            <p className="col-span-full text-xs text-slate-500 py-6 text-center">
              Nenhuma posição livre na Rua {aisle}. Selecione outra rua.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
