import { ipcMain, IpcMainEvent } from "electron"
import IpcDict from "../tool/ipc-dict"
import { OrderModel, OrderStatus } from "../models/dtos/OrderModel"
import { insertOrderAndDrinks, queryAllOrderAndDrinks, queryAllDrinksData, startCookingOrderWithDrinks, completeCookingOrderWithDrinks } from "../sqlite"
import { completeCooking, startCooking } from "./MQTTClientAPI"

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
        insertOrderAndDrinks(db, orderData).then(data => {
            event.reply(IpcDict.CODE_CREATE_ORDER_WITH_DRINKS, data)
        })
    })
    // 开始制作
    ipcMain.on(IpcDict.CODE_START_COOKING_WITH_DRINKS, (event: IpcMainEvent, orderId: number) => {
        queryAllOrderAndDrinks(db, orderId).then((order: any) => {
            if (order.length === 1) {
                startCooking(order[0]);
                if (order.order_status === OrderStatus.PENDING) {
                    startCookingOrderWithDrinks(db, orderId).then(data => {
                        event.reply(IpcDict.CODE_START_COOKING_WITH_DRINKS, data)
                    }).catch(err => event.reply(IpcDict.CODE_START_COOKING_WITH_DRINKS, false));
                } else {
                    event.reply(IpcDict.CODE_START_COOKING_WITH_DRINKS, false)
                }
            } else {
                event.reply(IpcDict.CODE_START_COOKING_WITH_DRINKS, false)
            }
        });
    })
    // 结束制作
    ipcMain.on(IpcDict.CODE_COMPLETE_COOKING_WITH_DRINKS, (event: IpcMainEvent, orderId: number) => {
        queryAllOrderAndDrinks(db, orderId).then((order: any) => {
            if (order.length === 1) {
                completeCooking(order[0]);
                if (order.order_status === OrderStatus.PENDING) {
                    completeCookingOrderWithDrinks(db, orderId).then(data => {
                        event.reply(IpcDict.CODE_COMPLETE_COOKING_WITH_DRINKS, data)
                    }).catch(err => event.reply(IpcDict.CODE_COMPLETE_COOKING_WITH_DRINKS, false))
                } else {
                    event.reply(IpcDict.CODE_COMPLETE_COOKING_WITH_DRINKS, false)
                }
            } else {
                event.reply(IpcDict.CODE_COMPLETE_COOKING_WITH_DRINKS, false)
            }
        });
    })
}
