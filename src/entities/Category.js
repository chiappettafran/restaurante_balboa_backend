import { EntitySchema } from "typeorm";

export const Category = new EntitySchema({
    name: "Category",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        name: {
            type: "varchar"
        },
        is_deleted: {
            type: "boolean",
            default: false,
        }
    },

    relations: {
        products: {
            type: "one-to-many",
            target: "Product",
            inverseSide: "category"
        }
    }
});