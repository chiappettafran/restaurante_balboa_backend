import { EntitySchema } from "typeorm";
import { ActiveAccount } from "./ActiveAccount.js";

export const Transaction = new EntitySchema({
    name: "Transaction", // Nombre de la entidad
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true,
        },
        type: {
            type: String, // Tipo de transacción: "deposit", "withdrawal", "purchase"
        },
        amount: {
            type: "real",
        },
        date: {
            type: String,
        },
        detail: {
            type: String,
        },
        super_detail: {
            type: String,
            default: '',
        },
        is_deleted: {
            type: "boolean",
            default: false,
        },
    },
    relations: {
        account: {
            type: "many-to-one",
            target: "ActiveAccount",
            inverseSide: "transactions",
            joinColumn: true,
        },
    },
});