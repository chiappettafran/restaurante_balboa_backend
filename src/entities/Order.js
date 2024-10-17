
import { EntitySchema } from "typeorm";

export const Order = new EntitySchema({
    name: "Order",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true,
        },
        productId: {
            type: "int",
        },
        quantity: {
            type: "int",
        },
        createdAt: {
            type: "timestamp",
            default: () => "CURRENT_TIMESTAMP",
        },
    },
    relations: {
        product: {
            type: "many-to-one",
            target: "Product",
            joinColumn: true, // Relación con la entidad Product
        },
    },
});