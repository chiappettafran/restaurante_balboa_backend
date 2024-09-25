import { EntitySchema } from "typeorm";

export const Invoice = new EntitySchema({
    name: "Invoice",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        date: {
            type: "datetime"
        },
        total_amount: {
            type: "float"
        },
        payment_method: {
            type: String
        },
        is_deleted: {
            type: "boolean",
            default: false,
        }
    },
    relations: {
        client: {
            type: "many-to-one",
            target: "User",
            inverseSide: "invoices",
            joinColumn: true
        },
        invoice_detail: {
            type: "one-to-many",
            target: "Invoice_Detail",
            inverseSide: "invoice",
            cascade: true
        }
    }
})