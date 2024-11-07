import { Router } from 'express';
import { AppDataSource } from '../data_source.js';
import { Invoice } from '../entities/Invoice.js';
import { User } from '../entities/User.js';

export const AdminSalesRoutes = () => {
    const router = Router();
    const invoiceRepository = AppDataSource.getRepository(Invoice);
    const userRepository = AppDataSource.getRepository(User);

    // Obtener ventas pendientes
    router.get('/pendingSales', async (req, res) => {
        try {
            const pendingSales = await invoiceRepository.find({
                where: { is_payment_confirmed: false },
            });
            res.json(pendingSales);
        } catch (err) {
            console.error('Error al obtener las ventas pendientes', err);
            res.status(500).json({ error: 'Error al obtener las ventas pendientes' });
        }
    });

    // Obtener ventas finalizadas
    router.get('/completedSales', async (req, res) => {
        try {
            const completedSales = await invoiceRepository.find({
                where: { is_payment_confirmed: true, is_deleted: false },
                relations: ['client'], // Asumiendo que quieres obtener la información del cliente
            });
            res.json(completedSales);
        } catch (err) {
            console.error('Error al obtener las ventas finalizadas', err);
            res.status(500).json({ error: 'Error al obtener las ventas finalizadas' });
        }
    });

    // Actualizar estado de una venta (pago confirmado)
    router.put('/updateSaleStatus/:id', async (req, res) => {
        const { id } = req.params;
        const { is_payment_confirmed } = req.body;

        try {
            const invoice = await invoiceRepository.findOne({
                where: { id },
            });

            if (!invoice) {
                return res.status(404).json({ error: 'Factura no encontrada' });
            }

            invoice.is_payment_confirmed = is_payment_confirmed;
            await invoiceRepository.save(invoice);

            res.json(invoice);
        } catch (err) {
            console.error('Error al actualizar el estado de la venta', err);
            res.status(500).json({ error: 'Error al actualizar el estado de la venta' });
        }
    });

    return router;
};
