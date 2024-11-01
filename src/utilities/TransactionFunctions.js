import {createConnection, getConnection} from "typeorm";
import {Transaction} from "../entities/Transaction.js";
import {ActiveAccount} from "../entities/ActiveAccount.js";

async function registerTransaction(accountName, type, amount) {
    const connection = getConnection();
    const accountRepository = connection.getRepository(ActiveAccount);
    const transactionRepository = connection.getRepository(Transaction);

    const account = await accountRepository.findOne({ where: { name: accountName } });

    if (account) {
        // Actualizar el saldo de la cuenta según el tipo de transacción
        if (type === "deposit") {
            account.balance += amount;
        } else if (type === "withdrawal" || type === "purchase") {
            account.balance -= amount;
        }

        // Guardar los cambios en la cuenta
        await accountRepository.save(account);

        // Crear la transacción y guardarla
        const transaction = transactionRepository.create({
            type,
            amount,
            account,
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