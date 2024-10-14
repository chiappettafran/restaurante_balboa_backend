import "reflect-metadata";
import { AppDataSource } from "./data_source.js";
import express from "express";
import {InvoiceRoutes} from "./routes/InvoiceRoutes.js";
import {UserRoutes} from "./routes/UserRoutes.js";
import {ProductRoutes} from "./routes/ProductRoutes.js";
import { fileURLToPath } from 'url';
import cors from "cors"
import multer from 'multer'
import path from 'path'
import fs from 'fs'


const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const fileName = `${req.body.name}${ext}`;
        cb(null, fileName);
    },
});

export const upload = multer({ storage });

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

