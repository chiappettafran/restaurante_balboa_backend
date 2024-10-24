import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/User.js";
import { Invoice } from "./entities/Invoice.js";
import { Invoice_Detail } from "./entities/Invoice_Detail.js";
import { Product } from "./entities/Product.js";
import { Category } from "./entities/Category.js";

export const AppDataSource = new DataSource({
    type: "better-sqlite3",
    database: "./database/basePrueba.db",
    username: "java_script",
    password: "frontend",
    synchronize: true,
    logging: false,
    entities: [User, Invoice, Invoice_Detail, Product, Category]
})