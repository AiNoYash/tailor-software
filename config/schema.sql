CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    mobile_no VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'worker') NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
    -- ? A table can only have 1 AUTO_INCREMENT at a time so we are having id itself as bill_no
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    mobile_no VARCHAR(20) NOT NULL,
    address TEXT,
    user_name VARCHAR(100) NOT NULL, -- ? The person who added the order
    order_date DATE NOT NULL,
    delivery_date DATE NOT NULL,
    total_amount DECIMAL(10, 2) DEFAULT 0.00,
    sewing_total DECIMAL(10, 2) DEFAULT 0.00,
    deposit_amount DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    item_type ENUM('pant', 'shirt') NOT NULL,
    quantity INT DEFAULT 1,
    details JSON,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS withdrawals(
    id INT AUTO_INCREMENT PRIMARY KEY,
    amount DECIMAL(10, 2) DEFAULT 0.00,
    user_id INT NOT NULL,
    withdrawal_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS work(
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    work_date DATE NOT NULL,
    pants_quantity INT DEFAULT 0,
    shirts_quantity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS expenses(
    id INT AUTO_INCREMENT PRIMARY KEY,
    expense_date DATE NOT NULL,
    amount DECIMAL(10, 2) DEFAULT 0.00,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);