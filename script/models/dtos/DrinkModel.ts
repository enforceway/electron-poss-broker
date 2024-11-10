
export class DrinkModel {
    public drinkId: number | null;
    public drinkName: string  | null;
    public price: number  | null;

    constructor(id: number, name: string, price) {
        this.drinkId = id || null;
        this.drinkName = name;
        this.price = price;
    }
}
