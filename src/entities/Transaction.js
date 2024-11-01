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
            type: "varchar", // Tipo de transacción: "deposit", "withdrawal", "purchase"
        },
        amount: {
            type: "real",
        },
        date: {
            type: "varchar",
        },
    },
    relations: {
        account: {
            type: "many-to-one",
            target: "ActiveAccount",
            joinColumn: true,
            cascade: true,
        },
    },
});