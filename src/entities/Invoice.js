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
            type: String
        },
        total_amount: {
            type: "float"
        },
        payment_method: {
            type: String
        },
        is_payment_confirmed: {
            type: "boolean",
            default: false
        },
        payment_proof_filePath: {
            type: String,
            default: ""
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