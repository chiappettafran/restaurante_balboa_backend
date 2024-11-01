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
            type: "varchar",
        },
        balance: {
            type: "real",
            default: 0,
        },
    },
});