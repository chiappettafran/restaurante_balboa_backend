import { Router } from "express";
import {AppDataSource} from "../data_source.js";
import {User} from "../entities/User.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {Transaction} from "../entities/Transaction.js";
import {ActiveAccount} from "../entities/ActiveAccount.js";
import {Between, Raw} from "typeorm";

export const AccountingRoutes = () => {
    const router = Router();
    const transactionRepository = AppDataSource.getRepository(Transaction)
    const accountRepository = AppDataSource.getRepository(ActiveAccount)

    router.get("/findAccountByName/all", async (req, res) => {
        const accountNames = await accountRepository
            .createQueryBuilder("account")
            .select(["account.name"])
            .where("account.is_deleted = is_deleted", { isDeleted: false })
            .getMany()

        if (accountNames) {
            res.status(200).json(accountNames);
        } else {
            res.status(404).json({error: "Account not found"});
        }
    })

    router.get("/findAccountByName/:name", async (req, res) => {
        const {name} = req.params
        const account = await accountRepository.find({
            where: {
                name: name,
                is_deleted: false
            },
            relations: {
                transactions: true
            }
        });
        if (account) {
            res.status(200).json(account);
        } else {
            res.status(404).json({error: "Account not found"});
        }
    })

    router.get("/findTransactions/:targetDate", async (req, res) => {
        const {targetDate} = req.params
        console.log(targetDate)
        const transactions = await transactionRepository
            .createQueryBuilder("transaction")
            .leftJoinAndSelect("transaction.account", "account")
            .select([
                "transaction.id",
                "transaction.type",
                "transaction.amount",
                "transaction.date",
                "transaction.detail",
                "transaction.is_deleted",
                "transaction.super_detail",
                "account.name"
            ])
            .where("transaction.is_deleted = :isDeleted", { isDeleted: false })
            .andWhere("transaction.type = :type", { type: "deposit" })
            .andWhere("transaction.date LIKE :date", { date: `${targetDate}%` })
            .getMany();
        if (transactions) {
            res.status(200).json(transactions);
        } else {
            res.status(404).json({error: "Transactions not found"});
        }
    })


    return router
}
