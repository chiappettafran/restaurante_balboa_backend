import { EntitySchema } from "typeorm"

export const Invoice_Detail = new EntitySchema({
    name: "Invoice_Detail",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        quantity: {
            type: "int"
        },
        amount: {
            type: "float"
        },
        is_deleted: {
            type: "boolean",
            default: false,
        }
    },

    relations: {
        invoice: {
            type: "many-to-one",
            target: "Invoice",
            inverseSide: "invoice_detail",
            joinColumn: true
        },
        product: {
            type: "many-to-one",
            target: "Product",
            inverseSide: "sales",
            joinColumn: true
        }
    }
})