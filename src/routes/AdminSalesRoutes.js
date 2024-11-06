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
            const pendingSales = await Invoice.find({
                where: { is_payment_confirmed: false }, // Asegúrate de que el campo esté bien
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
                relations: ['client'],
            });
            res.json(completedSales);
        } catch (err) {
            console.error('Error fetching completed sales:', err);
            res.status(500).json({ error: 'Error al obtener las ventas finalizadas' });
        }
    });

    return router;
};
