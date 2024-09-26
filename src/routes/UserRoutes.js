import { Router } from "express";
import {AppDataSource} from "../data_source.js";
import {User} from "../entities/User.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const UserRoutes = () => {
    const router = Router();
    const userRepository = AppDataSource.getRepository(User)

    router.post("/create", async (req, res) => {
        const user = userRepository.create(req.body);
        user.password = await bcrypt.hash(user.password, 5)
        await userRepository.save(user);
        res.status(201).json(user);
    })

    router.get("/find/all", async (req, res) => {
        const users = await userRepository.find({
            where: {is_deleted: false}
        });
        res.json(users);
    })

    router.get("/find/:id", async (req, res) => {
        const {id} = req.params;
        const user = await userRepository.findOne({
            where: {id, is_deleted: false}
        });
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({error: "User not found"});
        }
    })

    router.put("/update/:id", async (req, res) => {
        const {id} = req.params;
        await userRepository.update(id, req.body);
        const updatedUser = await userRepository.findOne({
            where: {id, is_deleted: false}
        });
        res.json(updatedUser);
    })

    router.patch("/delete/:id", async (req, res) => {
        const {id} = req.params;
        const result = await userRepository.update(id, {is_deleted: true});

        if (result.affected) {
            res.status(204).send('soft deleted user');
        } else {
            res.status(404).json({error: "User not found"});
        }
    })

    router.post("/login", async (req, res) => {
        const { email, password } = req.body;
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { email, is_deleted: false } });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, is_admin: user.is_admin },
            'soyeltoken',
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Inicio de sesión exitoso',
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                is_admin: user.is_admin,
                is_blocked: user.is_blocked,
            }
        });
    })
    return router
}










