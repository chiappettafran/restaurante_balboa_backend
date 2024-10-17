
import express from 'express';
import { getRepository } from 'typeorm';
import { Order } from '../entities/Order';

const router = express.Router();

router.post('/orders', async (req, res) => {
    const { productId, quantity, createdAt } = req.body;

    const orderRepository = getRepository(Order);
    const newOrder = orderRepository.create({ productId, quantity, createdAt });

    try {
        await orderRepository.save(newOrder);
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear la orden', error });
    }
});

export default router;
