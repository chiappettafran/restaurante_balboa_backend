import { Router } from "express";
import {AppDataSource} from "../data_source.js";
import {Invoice} from "../entities/Invoice.js";
import {Invoice_Detail} from "../entities/Invoice_Detail.js";

export const InvoiceRoutes = () => {
    const router = Router();
    const invoiceRepository = AppDataSource.getRepository(Invoice)

    router.post("/create", async (req, res) => {
        const invoice = invoiceRepository.create(req.body);
        await invoiceRepository.save(invoice);
        res.status(201).json(invoice);
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