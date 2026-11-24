import {
  AisleId,
  AisleStats,
  LevelNumber,
  ModuleCode,
  MovementRecord,
  WarehouseSlot,
  WarehouseStats,
} from '../types/wms';

export const AISLES: AisleId[] = ['A', 'B', 'C', 'D', 'E', 'F'];
export const MODULES: ModuleCode[] = ['P01', 'P02', 'P03', 'P04', 'P05'];
// Ordered from top (N5 = Topo) to bottom (N1 = Piso) for rack elevation display
export const LEVELS_TOP_DOWN: LevelNumber[] = [5, 4, 3, 2, 1];
export const LEVELS_BOTTOM_UP: LevelNumber[] = [1, 2, 3, 4, 5];

export const LEVEL_LABELS: Record<LevelNumber, string> = {
  1: 'N1 · Piso',
  2: 'N2 · Baixo',
  3: 'N3 · Médio',
  4: 'N4 · Alto',
  5: 'N5 · Topo',
};

export function buildSlotId(aisle: AisleId, module: ModuleCode, level: LevelNumber): string {
  return `${aisle}-${module}-N${level}`;
}

export function formatSlotAddress(aisle: AisleId, module: ModuleCode, level: LevelNumber): string {
  return `RUA-${aisle} / ${module} / NIVEL-${level}`;
}

export function createEmptyWarehouse(): WarehouseSlot[] {
  const now = new Date().toISOString();
  const slots: WarehouseSlot[] = [];

  for (const aisle of AISLES) {
    for (const module of MODULES) {
      for (const level of LEVELS_BOTTOM_UP) {
        slots.push({
          id: buildSlotId(aisle, module, level),
          address: formatSlotAddress(aisle, module, level),
          aisle,
          module,
          level,
          status: 'LIVRE',
          item: null,
          updatedAt: now,
        });
      }
    }
  }

  return slots;
}

interface SeedEntry {
  aisle: AisleId;
  module: ModuleCode;
  level: LevelNumber;
  sku: string;
  name: string;
  quantity: number;
  unit: string;
  hoursAgo: number;
}

const DEMO_INVENTORY: SeedEntry[] = [
  { aisle: 'A', module: 'P01', level: 1, sku: 'SKU-1001', name: 'Parafuso Sextavado M12 Aço Inox', quantity: 1200, unit: 'cx', hoursAgo: 48 },
  { aisle: 'A', module: 'P01', level: 2, sku: 'SKU-1004', name: 'Porca Travante M12 Zincada', quantity: 950, unit: 'cx', hoursAgo: 42 },
  { aisle: 'A', module: 'P02', level: 1, sku: 'SKU-2010', name: 'Bobina Filme Stretch 500mm', quantity: 64, unit: 'rl', hoursAgo: 36 },
  { aisle: 'A', module: 'P02', level: 3, sku: 'SKU-2010', name: 'Bobina Filme Stretch 500mm', quantity: 48, unit: 'rl', hoursAgo: 28 },
  { aisle: 'A', module: 'P03', level: 2, sku: 'SKU-3045', name: 'Caixa Papelão Ondulado 40x30x25', quantity: 400, unit: 'un', hoursAgo: 20 },
  { aisle: 'A', module: 'P04', level: 1, sku: 'SKU-1088', name: 'Fita Adesiva Industrial 48mm', quantity: 320, unit: 'rl', hoursAgo: 18 },
  { aisle: 'A', module: 'P05', level: 4, sku: 'SKU-4012', name: 'Etiqueta Térmica 100x50mm', quantity: 180, unit: 'rl', hoursAgo: 12 },

  { aisle: 'B', module: 'P01', level: 1, sku: 'SKU-5001', name: 'Motor Elétrico Trifásico 2CV', quantity: 12, unit: 'un', hoursAgo: 72 },
  { aisle: 'B', module: 'P01', level: 2, sku: 'SKU-5002', name: 'Inversor de Frequência 3kW', quantity: 18, unit: 'un', hoursAgo: 65 },
  { aisle: 'B', module: 'P02', level: 1, sku: 'SKU-5019', name: 'Redutor de Velocidade Coaxial', quantity: 9, unit: 'un', hoursAgo: 50 },
  { aisle: 'B', module: 'P03', level: 3, sku: 'SKU-6010', name: 'Cabo Flexível 6mm Preto (100m)', quantity: 35, unit: 'rl', hoursAgo: 30 },
  { aisle: 'B', module: 'P04', level: 2, sku: 'SKU-6011', name: 'Cabo Flexível 6mm Azul (100m)', quantity: 28, unit: 'rl', hoursAgo: 26 },
  { aisle: 'B', module: 'P04', level: 4, sku: 'SKU-6080', name: 'Disjuntor Tripolar 63A DIN', quantity: 140, unit: 'un', hoursAgo: 15 },
  { aisle: 'B', module: 'P05', level: 1, sku: 'SKU-5001', name: 'Motor Elétrico Trifásico 2CV', quantity: 8, unit: 'un', hoursAgo: 10 },

  { aisle: 'C', module: 'P01', level: 2, sku: 'SKU-7100', name: 'Óleo Hidráulico ISO VG 68 (20L)', quantity: 40, unit: 'gl', hoursAgo: 60 },
  { aisle: 'C', module: 'P02', level: 1, sku: 'SKU-7105', name: 'Graxa Complexo Lítio Balde 18kg', quantity: 24, unit: 'bd', hoursAgo: 54 },
  { aisle: 'C', module: 'P02', level: 2, sku: 'SKU-7100', name: 'Óleo Hidráulico ISO VG 68 (20L)', quantity: 32, unit: 'gl', hoursAgo: 44 },
  { aisle: 'C', module: 'P03', level: 1, sku: 'SKU-7200', name: 'Desengraxante Alcalino Concentrado', quantity: 30, unit: 'gl', hoursAgo: 32 },
  { aisle: 'C', module: 'P04', level: 3, sku: 'SKU-7310', name: 'Filtro Hidráulico Retorno 10µm', quantity: 85, unit: 'un', hoursAgo: 16 },
  { aisle: 'C', module: 'P05', level: 2, sku: 'SKU-7312', name: 'Mangueira Hidráulica R2AT 1/2"', quantity: 55, unit: 'mt', hoursAgo: 8 },

  { aisle: 'D', module: 'P01', level: 1, sku: 'SKU-8001', name: 'Capacete Segurança Classe B', quantity: 160, unit: 'un', hoursAgo: 40 },
  { aisle: 'D', module: 'P01', level: 3, sku: 'SKU-8015', name: 'Luva Nitrílica Anticorte Tam G', quantity: 420, unit: 'pr', hoursAgo: 35 },
  { aisle: 'D', module: 'P02', level: 2, sku: 'SKU-8022', name: 'Óculos Proteção Antirrisco Incolor', quantity: 300, unit: 'un', hoursAgo: 24 },
  { aisle: 'D', module: 'P03', level: 1, sku: 'SKU-8040', name: 'Botina Segurança Biqueira Composite', quantity: 72, unit: 'pr', hoursAgo: 14 },
  { aisle: 'D', module: 'P05', level: 3, sku: 'SKU-8090', name: 'Protetor Auricular Tipo Concha', quantity: 90, unit: 'un', hoursAgo: 6 },

  { aisle: 'E', module: 'P01', level: 2, sku: 'SKU-9010', name: 'Palete Plástico Vazado 1000x1200', quantity: 20, unit: 'un', hoursAgo: 46 },
  { aisle: 'E', module: 'P02', level: 1, sku: 'SKU-9025', name: 'Cantoneira Papelão Reforçada 1,2m', quantity: 500, unit: 'un', hoursAgo: 22 },
  { aisle: 'E', module: 'P04', level: 2, sku: 'SKU-3045', name: 'Caixa Papelão Ondulado 40x30x25', quantity: 350, unit: 'un', hoursAgo: 11 },

  { aisle: 'F', module: 'P01', level: 1, sku: 'SKU-9501', name: 'Rolo Etiqueta RFID UHF Adesiva', quantity: 60, unit: 'rl', hoursAgo: 19 },
  { aisle: 'F', module: 'P02', level: 4, sku: 'SKU-9512', name: 'Leitor Código de Barras 2D Sem Fio', quantity: 15, unit: 'un', hoursAgo: 9 },
  { aisle: 'F', module: 'P03', level: 2, sku: 'SKU-9530', name: 'Balança Plataforma Digital 300kg', quantity: 6, unit: 'un', hoursAgo: 4 },
];

const DEMO_UNAVAILABLE: Array<{
  aisle: AisleId;
  module: ModuleCode;
  level: LevelNumber;
  reason: string;
}> = [
  { aisle: 'B', module: 'P02', level: 5, reason: 'Manutenção na longarina superior' },
  { aisle: 'C', module: 'P04', level: 5, reason: 'Inspeção estrutural programada' },
  { aisle: 'D', module: 'P04', level: 1, reason: 'Área reservada para corredor transversal' },
  { aisle: 'E', module: 'P03', level: 4, reason: 'Avaria no protetor de coluna' },
  { aisle: 'F', module: 'P05', level: 5, reason: 'Proximidade ao sistema de sprinklers' },
];

export function createSeedWarehouse(): {
  slots: WarehouseSlot[];
  movements: MovementRecord[];
} {
  const slots = createEmptyWarehouse();
  const movements: MovementRecord[] = [];
  const nowMs = Date.now();

  const slotMap = new Map(slots.map((s) => [s.id, s]));

  for (const entry of DEMO_INVENTORY) {
    const id = buildSlotId(entry.aisle, entry.module, entry.level);
    const slot = slotMap.get(id);
    if (!slot) continue;

    const timestamp = new Date(nowMs - entry.hoursAgo * 3600 * 1000).toISOString();
    slot.status = 'OCUPADO';
    slot.updatedAt = timestamp;
    slot.item = {
      sku: entry.sku,
      name: entry.name,
      quantity: entry.quantity,
      unit: entry.unit,
      storedAt: timestamp,
    };

    movements.push({
      id: `mov-seed-${id}`,
      type: 'ENTRADA',
      slotId: id,
      address: slot.address,
      sku: entry.sku,
      productName: entry.name,
      quantity: entry.quantity,
      remainingQuantity: entry.quantity,
      note: 'Recebimento inicial',
      timestamp,
    });
  }

  for (const blocked of DEMO_UNAVAILABLE) {
    const id = buildSlotId(blocked.aisle, blocked.module, blocked.level);
    const slot = slotMap.get(id);
    if (!slot) continue;

    const timestamp = new Date(nowMs - 72 * 3600 * 1000).toISOString();
    slot.status = 'INDISPONIVEL';
    slot.blockReason = blocked.reason;
    slot.updatedAt = timestamp;

    movements.push({
      id: `mov-block-${id}`,
      type: 'BLOQUEIO',
      slotId: id,
      address: slot.address,
      note: blocked.reason,
      timestamp,
    });
  }

  movements.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return { slots, movements };
}

export function calculateWarehouseStats(slots: WarehouseSlot[]): WarehouseStats {
  const totalSlots = slots.length;
  let freeSlots = 0;
  let occupiedSlots = 0;
  let unavailableSlots = 0;
  let totalUnitsStored = 0;
  const skuSet = new Set<string>();

  const aisleBuckets: Record<AisleId, { total: number; free: number; occupied: number; unavailable: number }> = {
    A: { total: 0, free: 0, occupied: 0, unavailable: 0 },
    B: { total: 0, free: 0, occupied: 0, unavailable: 0 },
    C: { total: 0, free: 0, occupied: 0, unavailable: 0 },
    D: { total: 0, free: 0, occupied: 0, unavailable: 0 },
    E: { total: 0, free: 0, occupied: 0, unavailable: 0 },
    F: { total: 0, free: 0, occupied: 0, unavailable: 0 },
  };

  for (const slot of slots) {
    aisleBuckets[slot.aisle].total += 1;
    if (slot.status === 'LIVRE') {
      freeSlots += 1;
      aisleBuckets[slot.aisle].free += 1;
    } else if (slot.status === 'OCUPADO') {
      occupiedSlots += 1;
      aisleBuckets[slot.aisle].occupied += 1;
      if (slot.item) {
        totalUnitsStored += slot.item.quantity;
        skuSet.add(slot.item.sku.toUpperCase());
      }
    } else {
      unavailableSlots += 1;
      aisleBuckets[slot.aisle].unavailable += 1;
    }
  }

  const availableCapacity = totalSlots - unavailableSlots;
  const occupancyRate = totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0;

  const byAisle: AisleStats[] = AISLES.map((aisle) => {
    const b = aisleBuckets[aisle];
    return {
      aisle,
      total: b.total,
      free: b.free,
      occupied: b.occupied,
      unavailable: b.unavailable,
      occupancyRate: b.total > 0 ? (b.occupied / b.total) * 100 : 0,
    };
  });

  return {
    totalSlots,
    freeSlots,
    occupiedSlots,
    unavailableSlots,
    availableCapacity,
    occupancyRate,
    totalUnitsStored,
    distinctSkus: skuSet.size,
    byAisle,
  };
}

export function slotMatchesQuery(slot: WarehouseSlot, rawQuery: string): boolean {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return true;

  const searchable = [
    slot.id,
    slot.address,
    `rua ${slot.aisle}`,
    `rua-${slot.aisle}`,
    slot.module,
    `mod-${slot.module.replace('P', '')}`,
    `nivel ${slot.level}`,
    `nivel-${slot.level}`,
    `n${slot.level}`,
    slot.item?.sku ?? '',
    slot.item?.name ?? '',
    slot.blockReason ?? '',
  ]
    .join(' ')
    .toLowerCase();

  return searchable.includes(q);
}

export function formatDateTimeBr(isoDate: string): string {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}
