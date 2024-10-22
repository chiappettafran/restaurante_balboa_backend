import {Router} from "express";
import {AppDataSource} from "../data_source.js";
import {Product} from "../entities/Product.js";
import {upload} from "../index.js";
import {Category} from "../entities/Category.js";

export const ProductRoutes = () => {
    const router = Router();
    const productRepository = AppDataSource.getRepository(Product)
    const categoryRepository = AppDataSource.getRepository(Category)

    router.post("/create",upload.single('image'), async (req, res) => {
        const imageFile = req.file;
        const product = productRepository.create(req.body);

        product.category = await categoryRepository.findOne({
            where: {id: req.body.categoryId}
            }
        )

        if (imageFile) {
            product.image_url = `uploads/${imageFile.filename}`;
        }

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
        const category = await categoryRepository.findOne({
                where: {id: id}
            }
        )
        console.log(`Encontré la categoria: ${category}`)
        const products = await productRepository.find({
            where: {category: category, is_deleted: false},
            relations: ["category"]
        });
        if (products) {
            res.json(products);
        } else {
            res.status(404).json({error: "Products not found"});
        }
    })

    router.get("/fetchByCategory", async (req, res) => {
        const productsByCategory = await categoryRepository.find({
            where: {is_deleted: false},
            relations: ["products"],
        })
        if (productsByCategory) {
            const productsByCategoryFiltered = productsByCategory.map(category => ({
                ...category,
                products: category.products.filter(product => !product.is_deleted),
            }));
            res.json(productsByCategoryFiltered);
        } else {
            res.status(404).json({error: "Products not found"});
        }
    })

    router.put("/update/:id",upload.single('image'), async (req, res) => {
        const {id} = req.params;
        const imageFile = req.file;
        if (imageFile) {
            req.body.image_url = `uploads/${imageFile.filename}`;
        }

        req.body.category = await categoryRepository.findOne({
                where: {id: req.body.categoryId}
            }
        )
        delete req.body.categoryId

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