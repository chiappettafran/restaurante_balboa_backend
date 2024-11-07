import { Router } from "express";
import { AppDataSource } from "../data_source.js";
import { Invoice } from "../entities/Invoice.js";
import { Invoice_Detail } from "../entities/Invoice_Detail.js";
import { upload } from "../index.js";
import { addRemoveStock } from "../utilities/ProductFunctions.js";
import { registerTransaction } from "../utilities/TransactionFunctions.js";

export const InvoiceRoutes = () => {
    const router = Router();
    const invoiceRepository = AppDataSource.getRepository(Invoice);
    const invoiceDetailRepository = AppDataSource.getRepository(Invoice_Detail);

    // Ruta para crear una factura
    router.post("/create", upload.single('file'), async (req, res) => {
        const payment_proof_file = req.file;
        try {
            let { invoice_detail, ...invoiceData } = req.body;
            invoice_detail = invoice_detail ? JSON.parse(invoice_detail) : [];

            // Validación de detalles de la factura
            if (!invoice_detail || !Array.isArray(invoice_detail) || invoice_detail.length === 0) {
                return res.status(400).json({ error: 'Detalles de la factura no válidos' });
            }

            const invoice = invoiceRepository.create(invoiceData);

            // Si hay archivo de prueba de pago, lo guardamos
            if (payment_proof_file) {
                invoice.payment_proof_filePath = `uploads/${payment_proof_file.filename}`;
            }

            // Crear los detalles de la factura
            if (invoice_detail && Array.isArray(invoice_detail)) {
                invoice.invoice_detail = invoice_detail.map(detail => {
                    return invoiceDetailRepository.create({
                        quantity: detail.quantity,
                        product: { id: detail.product },
                    });
                });
            }

            await AppDataSource.transaction(async () => {
                // Guardar la factura
                await invoiceRepository.save(invoice);

                // Actualizar el inventario con los productos de la factura
                let cost = 0;
                for (const detail of invoice_detail) {
                    cost += await addRemoveStock(detail.product, -detail.quantity);
                }

                // Registrar transacciones para las operaciones de stock y ventas
                await registerTransaction("stock", "withdrawal", cost, "por venta");
                await registerTransaction("cmv", "deposit", cost, "a Stock", "Venta");
                await registerTransaction(invoice.payment_method, "deposit", invoice.total_amount, `a Ventas por ${invoice.payment_method}`, "Venta");
                await registerTransaction(`sales${invoice.payment_method}`, "withdrawal", -invoice.total_amount, "Venta");
            });

            res.status(201).json(invoice);
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: 'Error al crear la factura' });
        }
    });

    // Ruta para obtener todas las facturas no eliminadas
    router.get("/find/all", async (req, res) => {
        try {
            const invoices = await invoiceRepository.find({
                where: { is_deleted: false },
                relations: ["invoice_detail"]
            });
            res.json(invoices);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener las facturas' });
        }
    });

    // Ruta para obtener una factura por ID
    router.get("/find/:id", async (req, res) => {
        const { id } = req.params;
        try {
            const invoice = await invoiceRepository.findOne({
                where: { id, is_deleted: false },
                relations: ["invoice_detail"]
            });
            if (invoice) {
                res.json(invoice);
            } else {
                res.status(404).json({ error: "Factura no encontrada" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener la factura' });
        }
    });

    // Ruta para actualizar una factura
    router.put("/update/:id", async (req, res) => {
        const { id } = req.params;
        try {
            const invoice = await invoiceRepository.findOne({ where: { id } });
            if (!invoice) {
                return res.status(404).json({ error: 'Factura no encontrada' });
            }

            await invoiceRepository.update(id, req.body);
            const updatedInvoice = await invoiceRepository.findOne({
                where: { id, is_deleted: false },
                relations: ["invoice_detail"]
            });
            res.json(updatedInvoice);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al actualizar la factura' });
        }
    });

    // Ruta para eliminar (soft delete) una factura
    router.patch("/delete/:id", async (req, res) => {
        const { id } = req.params;
        try {
            const result = await invoiceRepository.update(id, { is_deleted: true });

            if (result.affected) {
                // Actualizar los detalles de la factura a "eliminado"
                await invoiceDetailRepository.update({ invoice: { id } }, { is_deleted: true });
                res.status(204).send('Factura eliminada');
            } else {
                res.status(404).json({ error: "Factura no encontrada" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al eliminar la factura' });
        }
    });

    // Ruta para obtener las facturas pendientes (no pagadas)
    router.get("/find/pending", async (req, res) => {
        try {
            const pendingInvoices = await invoiceRepository.find({
                where: {
                    is_deleted: false,
                    is_payment_confirmed: false
                }
            });
            res.json(pendingInvoices);
        } catch (error) {
            res.status(500).json({ error: "Error fetching pending invoices" });
        }
    });

    // Ruta para obtener las facturas finalizadas (pagadas)
    router.get('/find/finalized', async (req, res) => {
        try {
            const invoices = await invoiceRepository.find({
                where: { is_payment_confirmed: true, is_deleted: false }, // Facturas pagadas
            });
            res.json(invoices);
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al obtener las facturas finalizadas');
        }
    });

    return router;
};