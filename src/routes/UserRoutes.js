import { Router } from "express";
import {AppDataSource} from "../data_source.js";
import {User} from "../entities/User.js";

export const UserRoutes = () => {
    const router = Router();
    const userRepository = AppDataSource.getRepository(User)

    router.post("/create", async (req, res) => {
        const user = userRepository.create(req.body);
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

    return router
}