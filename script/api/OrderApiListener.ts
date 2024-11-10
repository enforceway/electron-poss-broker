import { ipcMain, IpcMainEvent } from "electron"
import IpcDict from "../tool/ipc-dict"
import { OrderModel, OrderStatus } from "../models/dtos/OrderModel"
import { insertOrderAndDrinks, queryAllOrderAndDrinks, queryAllDrinksData, startCookingOrderWithDrinks, completeCookingOrderWithDrinks, restartCookingOrderWithDrinks } from "../sqlite"
import { completeCooking, orderCreated, restartCooking, startCooking } from "./MQTTClientAPI"

export function listen(db) {
    // 获取所有订单
    ipcMain.on(IpcDict.CODE_ORDER_QUERY, (event: IpcMainEvent) => {
        queryAllOrderAndDrinks(db).then(data => {
            event.reply(IpcDict.CODE_ORDER_QUERY, data)
        })
    })
    // 获取所有饮品
    ipcMain.on(IpcDict.CODE_DRINKS_QUERY, (event: IpcMainEvent, data: any, appendix: any) => {
        queryAllDrinksData(db).then(data => {
            event.reply(IpcDict.CODE_DRINKS_QUERY, data)
        })
    })
    // 创建订单
    ipcMain.on(IpcDict.CODE_CREATE_ORDER_WITH_DRINKS, (event: IpcMainEvent, orderData: OrderModel) => {
        insertOrderAndDrinks(db, orderData).then((data: any) => {
            orderCreated(data);
            event.reply(IpcDict.CODE_CREATE_ORDER_WITH_DRINKS, data)
        })
    })
    // 开始制作
    ipcMain.on(IpcDict.CODE_START_COOKING_WITH_DRINKS, (event: IpcMainEvent, orderId: number) => {
        queryAllOrderAndDrinks(db, orderId).then((order: any) => {
            if (order.length === 1) {
                startCookingOrderWithDrinks(db, orderId).then(data => {
                    order[0].order_status = OrderStatus.IN_PROGRESS;
                    const convertOrderModel = new OrderModel(order[0].order_id, order[0].order_type, order[0].order_date, order[0].order_total_amount, order[0].order_status);
                    startCooking(convertOrderModel);
                    event.reply(IpcDict.CODE_START_COOKING_WITH_DRINKS, data)
                }).catch(err => event.reply(IpcDict.CODE_START_COOKING_WITH_DRINKS, false));
            } else {
                event.reply(IpcDict.CODE_START_COOKING_WITH_DRINKS, false)
            }
        });
    })
    // 结束制作
    ipcMain.on(IpcDict.CODE_COMPLETE_COOKING_WITH_DRINKS, (event: IpcMainEvent, orderId: number) => {
        queryAllOrderAndDrinks(db, orderId).then((order: any) => {
            if (order.length === 1) {
                completeCookingOrderWithDrinks(db, orderId).then(data => {
                    order[0].order_status = OrderStatus.COMPLETED;
                    const convertOrderModel = new OrderModel(order[0].order_id, order[0].order_type, order[0].order_date, order[0].order_total_amount, order[0].order_status);
                    completeCooking(convertOrderModel);
                    event.reply(IpcDict.CODE_COMPLETE_COOKING_WITH_DRINKS, convertOrderModel)
                }).catch(err => event.reply(IpcDict.CODE_COMPLETE_COOKING_WITH_DRINKS, false))
            } else {
                event.reply(IpcDict.CODE_COMPLETE_COOKING_WITH_DRINKS, false)
            }
        });
    })
    // 重新制作
    ipcMain.on(IpcDict.CODE_RESTART_COOKING_WITH_DRINKS, (event: IpcMainEvent, orderId: number) => {
        queryAllOrderAndDrinks(db, orderId).then((order: any) => {
            if (order.length === 1) {
                restartCookingOrderWithDrinks(db, orderId).then(data => {
                    order[0].order_status = OrderStatus.IN_PROGRESS;
                    const convertOrderModel = new OrderModel(order[0].order_id, order[0].order_type, order[0].order_date, order[0].order_total_amount, order[0].order_status);
                    restartCooking(convertOrderModel);
                    event.reply(IpcDict.CODE_RESTART_COOKING_WITH_DRINKS, convertOrderModel)
                }).catch(err => event.reply(IpcDict.CODE_START_COOKING_WITH_DRINKS, false));
            } else {
                event.reply(IpcDict.CODE_START_COOKING_WITH_DRINKS, false)
            }
        });
    })
}
