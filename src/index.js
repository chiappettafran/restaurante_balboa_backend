import "reflect-metadata";
import { AppDataSource } from "./data_source.js";
import express from "express";
import {InvoiceRoutes} from "./routes/InvoiceRoutes.js";
import {UserRoutes} from "./routes/UserRoutes.js";
import {ProductRoutes} from "./routes/ProductRoutes.js";
import cors from "cors"


const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());
app.use("/invoice", InvoiceRoutes())
app.use("/user", UserRoutes())
app.use("/product", ProductRoutes())

AppDataSource.initialize().then(() => {
    console.log("Conexión Establecida")

    app.listen(3001, () => {
        console.log("Servidor escuchando en http://localhost:3001")
    })
}).catch((error) => console.log("Error al conectar a la base de datos:", error))

