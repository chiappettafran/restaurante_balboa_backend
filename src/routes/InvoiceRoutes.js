import {Router} from "express";
import {AppDataSource} from "../data_source.js";
import {Invoice} from "../entities/Invoice.js";
import {Invoice_Detail} from "../entities/Invoice_Detail.js";
import {upload} from "../index.js";
import {addRemoveStock} from "../utilities/ProductFunctions.js";
import {registerTransaction} from "../utilities/TransactionFunctions.js";

export const InvoiceRoutes = () => {
    const router = Router();
    const invoiceRepository = AppDataSource.getRepository(Invoice)
    const invoiceDetailRepository = AppDataSource.getRepository(Invoice_Detail)

    router.post("/create", upload.single('file'), async (req, res) => {
        const payment_proof_file = req.file
        try {
            let { invoice_detail, ...invoiceData } = req.body;
            const invoice = invoiceRepository.create(invoiceData)
            invoice_detail = invoice_detail ? JSON.parse(invoice_detail) : [];

            if (payment_proof_file) {
                invoice.payment_proof_filePath = `uploads/${payment_proof_file.filename}`
            }

            if (invoice_detail && Array.isArray(invoice_detail)) {
                invoice.invoice_detail = invoice_detail.map(detail => {
                    return invoiceDetailRepository.create({
                        quantity: detail.quantity,
                        product: {id: detail.product},
                    });
                })
            }

            await AppDataSource.transaction(async () => {
                    await invoiceRepository.save(invoice);
                    let cost = 0
                    for (const detail of invoice_detail) {
                        cost += await addRemoveStock(detail.product, -detail.quantity)
                    }
                    await registerTransaction("stock", "withdrawal", cost, "por venta")
                    await registerTransaction("cmv", "deposit", cost, "a Stock", "Venta")
                    await registerTransaction(invoice.payment_method, "deposit", invoice.total_amount, `a Ventas por ${invoice.payment_method}`, "Venta")
                    await registerTransaction(`sales${invoice.payment_method}`, "withdrawal", -invoice.total_amount, "Venta")
                }
            )
            res.status(201).json(invoice);

        } catch (e) {
            console.error(e);
            res.status(500).json({ error: 'Error al crear la factura' });

        }
    })

    router.get("/find/all", async (req, res) => {
        const invoices = await invoiceRepository.find({
            where: {is_deleted: false},
            relations: ["invoice_detail"]
        });
        res.json(invoices);
    })

    router.get("/find/:id", async (req, res) => {
        const { id } = req.params;
        const invoice = await invoiceRepository.findOne({
            where: { id, is_deleted: false },
            relations: ["invoice_detail"]
        });
        if (invoice) {
            res.json(invoice);
        } else {
            res.status(404).json({ error: "Invoice not found" });
        }
    })

    router.put("/update/:id", async (req, res) => {
        const { id } = req.params;
        await invoiceRepository.update(id, req.body);
        const updatedInvoice = await invoiceRepository.findOne({
            where: { id, is_deleted: false },
            relations: ["invoice_detail"]
        });
        res.json(updatedInvoice);
    })

    router.patch("/delete/:id", async (req, res) => {
        const { id } = req.params;
        const result = await invoiceRepository.update(id, { is_deleted: true });

        if (result.affected) {
            const invoiceDetailRepository = AppDataSource.getRepository(Invoice_Detail);
            await invoiceDetailRepository.update({ invoice: { id } }, { is_deleted: true });
            res.status(204).send('soft deleted invoice');
        } else {
            res.status(404).json({ error: "Invoice not found" });
        }
    })

    return router

}