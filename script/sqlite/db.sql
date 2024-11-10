CREATE TABLE orders (
    order_id INTEGER PRIMARY KEY AUTOINCREMENT, -- primary key
    order_type TEXT, -- order type: 1 - purchase on spot, 2 - purchase online
    order_status TEXT, -- order status: 1 - created, 2 - pending, 3 - in progress, 4 - completed
    order_date TEXT, -- purchase date
    order_total_amount DECIMAL(10, 2), -- order total amount
);
CREATE TABLE drinks (
    drink_id INTEGER PRIMARY KEY AUTOINCREMENT, 
    drink_name TEXT,
    price DECIMAL(10, 3)
);
CREATE TABLE order_and_drinks (
    busi_id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER, 
    drink_id INTEGER, 
    quantity INTEGER
    -- FOREIGN KEY (order_id) REFERENCES orders(order_id),
    -- FOREIGN KEY (drink_id) REFERENCES drinks(drink_id)
);