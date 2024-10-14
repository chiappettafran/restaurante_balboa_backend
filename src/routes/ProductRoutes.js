import { Router } from "express";
import {AppDataSource} from "../data_source.js";
import {Product} from "../entities/Product.js";

export const ProductRoutes = () => {
    const router = Router();
    const productRepository = AppDataSource.getRepository(Product)

    router.post("/create", async (req, res) => {
        const product = productRepository.create(req.body);
        await productRepository.save(product);
        res.status(201).json(product);
    })

    router.get("/find/all", async (req, res) => {
        const products = await productRepository.find({
            where: {is_deleted: false},
            relations: ["category"]
        });
        res.json(products);
    })

    router.get("/find/:id", async (req, res) => {
        const {id} = req.params;
        const product = await productRepository.findOne({
            where: {id, is_deleted: false},
            relations: ["category"]
        });
        if (products) {
            res.json(product);
        } else {
            res.status(404).json({error: "Product not found"});
        }
    })

    router.get("/findByCategory/:categoryId", async (req, res) => {
        const {id} = req.params;
        const products = await productRepository.find({
            where: {categoryId: id, is_deleted: false},
            relations: ["category"]
        });
        if (products) {
            res.json(products);
        } else {
            res.status(404).json({error: "Products not found"});
        }
    })

    router.put("/update/:id", async (req, res) => {
        const {id} = req.params;
        await productRepository.update(id, req.body);
        const updatedProduct = await productRepository.findOne({
            where: {id, is_deleted: false}
        });
        res.json(updatedProduct);
    })

    router.patch("/delete/:id", async (req, res) => {
        const {id} = req.params;
        const result = await productRepository.update(id, {is_deleted: true});

        if (result.affected) {
            res.status(204).send('soft deleted product');
        } else {
            res.status(404).json({error: "product not found"});
        }
    })

    return router
}