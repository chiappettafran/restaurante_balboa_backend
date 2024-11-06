import { EntitySchema } from "typeorm";

export const ActiveAccount = new EntitySchema({
    name: "ActiveAccount", // Nombre de la entidad
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true,
        },
        name: {
            type: String,
        },
        type: {
            type: String,
            default: "active"
        },
        balance: {
            type: "real",
            default: 0,
        },
        is_deleted: {
            type: "boolean",
            default: false,
        },
    },
    relations: {
        transactions: {
            type: "one-to-many",
            target: "Transaction",
            inverseSide: "account",
        }
    }
});