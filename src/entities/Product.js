import { EntitySchema } from "typeorm"

export const Product = new EntitySchema({
    name: "Product",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        name: {
            type: "varchar"
        },
        sale_price: {
            type: "float"
        },
        cost: {
            type: "float"
        },
        image_url: {
            type: "varchar",
            nullable: true
        },
        description: {
            type: "varchar",
            nullable: true
        },
        is_deleted: {
            type: "boolean",
            default: false,
        }
    },

    relations: {
        sales: {
            type: "one-to-many",
            target: "Invoice_Detail",
            inverseSide: "product"
        },
        category: {
            type: "many-to-one",
            target: "Category",
            inverseSide: "products",
            nullable: true
        }
    }
})