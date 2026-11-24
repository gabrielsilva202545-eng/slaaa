export type AisleId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export type ModuleCode = 'P01' | 'P02' | 'P03' | 'P04' | 'P05';

export type LevelNumber = 1 | 2 | 3 | 4 | 5;

export type SlotStatus = 'LIVRE' | 'OCUPADO' | 'INDISPONIVEL';

export interface PalletItem {
  sku: string;
  name: string;
  quantity: number;
  unit?: string;
  lot?: string;
  storedAt: string;
}

export interface WarehouseSlot {
  id: string; // e.g., "A-P02-N3"
  address: string; // e.g., "RUA-A / P02 / NIVEL-3"
  aisle: AisleId;
  module: ModuleCode;
  level: LevelNumber;
  status: SlotStatus;
  item: PalletItem | null;
  blockReason?: string;
  updatedAt: string;
}

export type MovementType = 'ENTRADA' | 'SAIDA' | 'BLOQUEIO' | 'DESBLOQUEIO';

export interface MovementRecord {
  id: string;
  type: MovementType;
  slotId: string;
  address: string;
  sku?: string;
  productName?: string;
  quantity?: number;
  remainingQuantity?: number;
  note?: string;
  timestamp: string;
}

export interface AisleStats {
  aisle: AisleId;
  total: number;
  free: number;
  occupied: number;
  unavailable: number;
  occupancyRate: number;
}

export interface WarehouseStats {
  totalSlots: number;
  freeSlots: number;
  occupiedSlots: number;
  unavailableSlots: number;
  availableCapacity: number;
  occupancyRate: number;
  totalUnitsStored: number;
  distinctSkus: number;
  byAisle: AisleStats[];
}

export type ActiveTab = 'MAPA' | 'PUTAWAY' | 'PICKING' | 'INVENTARIO' | 'HISTORICO';
