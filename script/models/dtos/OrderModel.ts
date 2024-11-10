
export class OrderModel {
    public orderId: number;
    public orderType: string;
    public orderDate: string;
    public orderStatus: OrderStatus;
    public orderTotalAmount: number;

    constructor(id, type, date, total_amount, orderStatus) {
        this.orderId = id || null;
        this.orderType = type;
        this.orderDate = date;
        this.orderStatus = orderStatus || OrderStatus.CREATED;
        this.orderTotalAmount = total_amount;
    }
}

export enum OrderStatus {
    CREATED = 'created'
    , PENDING = 'pending'
    , IN_PROGRESS = 'inprogress'
    , COMPLETED = 'completed'
}

// export enum OrderType {
//     ON_SPOT = 'on_spot'
//     , ONLINE = 'online'
// }