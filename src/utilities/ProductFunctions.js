import {AppDataSource} from "../data_source.js";
import {Product} from "../entities/Product.js";
import {registerTransaction} from "./TransactionFunctions.js";

export const addRemoveStock = async (productId, stockModifier, paymentMethod, detail) => {
    const productRepository = AppDataSource.getRepository(Product)

    try {
        const product = await productRepository.findOneByOrFail({
            id: productId
        })
        product.existences = product.existences + stockModifier

        if (stockModifier > 0) {
            await registerTransaction(paymentMethod, "withdrawal", product.cost*stockModifier, "Compra de mercaderia")
            await registerTransaction("stock", "deposit", product.cost*stockModifier, "a mercadoPago", "Compra de Mercadería")
        }

        await productRepository.save(product)

        if (stockModifier < 0) {
            return -product.cost*stockModifier
        }

    } catch (e) {
        console.log("Error al modificar stock: "+e)
    }

}