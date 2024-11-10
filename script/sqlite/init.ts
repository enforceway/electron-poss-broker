import { OrderModel, OrderStatus } from "../models/dtos/OrderModel";
import DayJS from "dayjs";

import sqlite3  from 'sqlite3'; 
import path from 'path';
import { LocalLogger } from "../core/AppLogger";

sqlite3.verbose();

let db;

function databasePath(app) {
    const userDataPath = app.getPath('userData');
    return userDataPath;
};

export function initDB(app) {
    // 初始化数据库
    db = new sqlite3.Database(path.join(databasePath(app), 'v3-electrion-vite-startup.db'));
    // 在此处进行数据库操作
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        order_id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_type TEXT,
        order_date TEXT,
        order_status TEXT,
        order_total_amount DECIMAL(10, 2)
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS drinks (
        drink_id INTEGER PRIMARY KEY AUTOINCREMENT, 
        drink_name TEXT,
        price DECIMAL(10, 3),
        img TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS order_and_drinks (
        busi_id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER, 
        drink_id INTEGER, 
        quantity INTEGER
    );`);
    return db;
};



export function queryAllOrderAndDrinks(db, orderId?: number | string) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            let SQL_STATEMENTS = 'SELECT order_id, order_type, order_date, order_status, order_total_amount from orders';
            const PREPAREMENTS_PARAMS: Array<number | string> = [];
            if (orderId !== undefined && orderId !== null) {
                SQL_STATEMENTS = `${SQL_STATEMENTS} where order_id = ?`;
                PREPAREMENTS_PARAMS.push(orderId);
                LocalLogger.Index.log(`Order ${orderId} with selection sql is ${SQL_STATEMENTS} `, PREPAREMENTS_PARAMS);
            }
            // 执行一些数据库操作
            db.all(SQL_STATEMENTS, PREPAREMENTS_PARAMS, function (err, rows) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        });
    });
};

export function queryAllDrinksData(db) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // 执行一些数据库操作
            db.all('SELECT drink_id, drink_name, price, img from drinks', [], function (err, rows) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        });
    });
};

export function insertOrderAndDrinks(db, orderData: OrderModel) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // 开启事务
            db.run('BEGIN TRANSACTION');
            // 执行一些数据库操作
            db.run('INSERT INTO orders(order_type, order_date, order_status, order_total_amount) VALUES (?,?,?,?)', [
                orderData.orderType,
                DayJS(new Date()).format("YYYY-MM-DD"),
                OrderStatus.PENDING,
                orderData.orderTotalAmount
            ], function (err) {
                if (err) {
                    db.rollback(() => {
                        console.error('更新操作失败，已回滚事务：', err);
                    });
                    reject(err);
                    return;
                }
                // 提交事务
                db.run('COMMIT');
                orderData.orderId = this.lastID;
                // db.run('INSERT INTO order_and_drinks(order_id, drink_id, quantity) VALUES (?,?,?)', [orderData.order_id, drinkData.drink_id, drinkData.quantity], function (err) {
                //     if (err) {
                //         db.rollback(() => {
                //             console.error('更新操作失败，已回滚事务：', err);
                //         });
                //         reject(err);
                //         return;
                //     }
                //     debugger
                //     const order_drink_id = this.lastID;
                //     resolve(order_drink_id);
                // });
                resolve(orderData);
                // resolve(new DBOperationResult(true, '数据插入成功', null));
            });
        });
    });
};

function updateOrderStatus(db: sqlite3.Database, orderId: number, status: OrderStatus,) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // 开启事务
            db.run('BEGIN TRANSACTION');
            LocalLogger.Index.log(`UPDATE orders set order_status = ? where order_id = ?`, orderId, ', ', status);
            // 执行一些数据库操作
            db.run('UPDATE orders set order_status = ? where order_id = ?', [
                status,
                orderId
            ], function (err) {
                if (err) {
                    db.run('ROLLBACK', () => {
                        console.error('更新操作失败，已回滚事务：', err);
                    });
                    reject(err);
                    return;
                }
                // 提交事务
                db.run('COMMIT');
                resolve(1);
            });
        });
    });
};
export function startCookingOrderWithDrinks(db, orderId: number) {
    return updateOrderStatus(db, orderId, OrderStatus.IN_PROGRESS);
};

export function restartCookingOrderWithDrinks(db, orderId: number) {
    return updateOrderStatus(db, orderId, OrderStatus.IN_PROGRESS);
};

export function completeCookingOrderWithDrinks(db, orderId: number) {
    return updateOrderStatus(db, orderId, OrderStatus.COMPLETED);
};
