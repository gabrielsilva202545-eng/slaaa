import { MovementRecord, WarehouseSlot } from '../types/wms';
import { createEmptyWarehouse, createSeedWarehouse } from '../utils/warehouse';

const SLOTS_STORAGE_KEY = 'wms_estrutura_slots_v1';
const MOVEMENTS_STORAGE_KEY = 'wms_estrutura_movements_v1';

export interface WmsPersistedState {
  slots: WarehouseSlot[];
  movements: MovementRecord[];
}

export function loadWmsState(): WmsPersistedState {
  try {
    const rawSlots = localStorage.getItem(SLOTS_STORAGE_KEY);
    const rawMovements = localStorage.getItem(MOVEMENTS_STORAGE_KEY);

    if (rawSlots) {
      const parsedSlots = JSON.parse(rawSlots) as WarehouseSlot[];
      if (Array.isArray(parsedSlots) && parsedSlots.length === 150) {
        const parsedMovements = rawMovements ? (JSON.parse(rawMovements) as MovementRecord[]) : [];
        return {
          slots: parsedSlots,
          movements: Array.isArray(parsedMovements) ? parsedMovements : [],
        };
      }
    }
  } catch {
    // Fallback to initial seed state if storage is corrupted or unavailable
  }

  const seeded = createSeedWarehouse();
  saveWmsState(seeded.slots, seeded.movements);
  return seeded;
}

export function saveWmsState(slots: WarehouseSlot[], movements: MovementRecord[]): void {
  try {
    localStorage.setItem(SLOTS_STORAGE_KEY, JSON.stringify(slots));
    localStorage.setItem(MOVEMENTS_STORAGE_KEY, JSON.stringify(movements));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function resetToDemoData(): WmsPersistedState {
  const seeded = createSeedWarehouse();
  saveWmsState(seeded.slots, seeded.movements);
  return seeded;
}

export function clearAllWarehouseData(): WmsPersistedState {
  const empty: WmsPersistedState = {
    slots: createEmptyWarehouse(),
    movements: [],
  };
  saveWmsState(empty.slots, empty.movements);
  return empty;
}
