"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOrderDto = exports.CreateOrderItemDto = exports.CreateOrderItemVariationDto = void 0;
class CreateOrderItemVariationDto {
    menuItemVariationId;
    name;
    additionalPrice;
}
exports.CreateOrderItemVariationDto = CreateOrderItemVariationDto;
class CreateOrderItemDto {
    menuItemId;
    name;
    quantity;
    price;
    specialInstructions;
    variations;
}
exports.CreateOrderItemDto = CreateOrderItemDto;
class CreateOrderDto {
    tableNumber;
    notes;
    items;
}
exports.CreateOrderDto = CreateOrderDto;
//# sourceMappingURL=create-order.dto.js.map