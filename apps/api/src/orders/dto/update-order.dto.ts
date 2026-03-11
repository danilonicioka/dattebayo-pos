// These DTOs are no longer used directly (routes use plain JSON parsing)
// Kept as plain interfaces for type reference only
export interface UpdateOrderDto {
  status?: 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  tableNumber?: string | null;
  notes?: string | null;
}
