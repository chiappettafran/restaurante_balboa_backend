import { EntitySchema } from "typeorm"

export const User = new EntitySchema({
    name: "User",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        full_name: {
            type: "varchar"
        },
        age: {
            type: "int",
            nullable: true
        },
        dni: {
            type: "int"
        },
        is_admin: {
            type: "boolean",
            default: false
        },
        is_blocked: {
            default: false,
            type: "boolean"
        },
        email: {
            type: "varchar"
        },
        password: {
            type: "varchar"
        },
        is_deleted: {
            type: "boolean",
            default: false,
        }
    },

    relations: {
        invoices: {
            type: "one-to-many",
            target: "Invoice",
            inverseSide: "client"
        }
    }
})