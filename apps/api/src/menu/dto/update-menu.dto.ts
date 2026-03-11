// These DTOs are no longer used directly (routes use plain JSON parsing)
// Kept as plain interfaces for type reference only
export interface UpdateMenuDto {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  available?: boolean;
  stockQuantity?: number | null;
  manualPrice?: number | null;
  manualPriceEnabled?: boolean;
  applyMarkup?: boolean;
  variations?: any[];
}
