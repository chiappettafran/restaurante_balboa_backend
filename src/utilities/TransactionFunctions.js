import {createConnection, getConnection} from "typeorm";
import {Transaction} from "../entities/Transaction.js";
import {ActiveAccount} from "../entities/ActiveAccount.js";
import {AppDataSource} from "../data_source.js";

export async function registerTransaction(accountName, type, amount, detail, super_detail) {

    const accountRepository = AppDataSource.getRepository(ActiveAccount);
    const transactionRepository = AppDataSource.getRepository(Transaction);

    const account = await accountRepository.findOne({ where: { name: accountName } });

    if (account) {
        // Actualizar el saldo de la cuenta según el tipo de transacción
        if (type === "deposit") {
            let aux = account.balance
            account.balance = Number(aux) + Number(amount)
        } else if (type === "withdrawal" || type === "purchase") {
            account.balance -= amount;
        }

        // Guardar los cambios en la cuenta
        await accountRepository.save(account);
        const today = new Date().toISOString();

        // Crear la transacción y guardarla
        if (amount < 0) {
            amount = amount*-1
        }

        const transaction = transactionRepository.create({
            type,
            amount,
            account,
            date: today,
            detail,
            super_detail: super_detail ? super_detail : ''
        });

        await transactionRepository.save(transaction);
        console.log(`Transacción registrada: ${type} de ${amount} a ${accountName}`);
    } else {
        console.log("Cuenta no encontrada");
    }
}

async function main() {
    const connection = await createConnection(); // Asegúrate de que la conexión esté activa

    // Inicializar cuentas si no existen
    //await initializeAccounts(); // Implementa esta función para inicializar cuentas si es necesario.

    // Ejemplo de depósitos y compras
    await registerTransaction("Mercado Pago", "deposit", 1000); // Depositar 1000 en Mercado Pago
    await registerTransaction("Bitcoin Wallet", "withdrawal", 200); // Retirar 200 de Bitcoin Wallet
    await registerTransaction("Products", "purchase", 150); // Comprar productos por 150

    // Consulta de transacciones
    //await getTransactionsByAccount("Mercado Pago"); // Ver transacciones de Mercado Pago
}