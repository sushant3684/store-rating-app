const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function initDatabase() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD
    });

    console.log('connected to mysql');

    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'store_rating_db'}`);
    console.log('db created');

    await connection.query(`USE ${process.env.DB_NAME || 'store_rating_db'}`);

    await connection.query('DROP TABLE IF EXISTS ratings');
    await connection.query('DROP TABLE IF EXISTS stores');
    await connection.query('DROP TABLE IF EXISTS users');

    await connection.query(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        address VARCHAR(400),
        role ENUM('admin', 'user', 'owner') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('users table ok');

    await connection.query(`
      CREATE TABLE stores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        address VARCHAR(400),
        owner_id INT,
        owner_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_name (name),
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('stores table ok');

    await connection.query(`
      CREATE TABLE ratings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        store_id INT NOT NULL,
        rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_store (user_id, store_id),
        INDEX idx_store (store_id),
        INDEX idx_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('ratings table ok');

    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    await connection.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      ['Admin User', 'admin@storerating.com', hashedPassword, 'Hinjewadi, Pune', 'admin']
    );
    console.log('admin user created');
    console.log('email: admin@storerating.com');
    console.log('pass: Admin@123');

    const owner1Pass = await bcrypt.hash('Owner@123', 10);
    const owner2Pass = await bcrypt.hash('Owner@456', 10);

    await connection.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      ['John Doe', 'starbucks@stores.com', owner1Pass, 'Bavdhan, Pune', 'owner']
    );

    await connection.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      ['Jane Smith', 'amazon@stores.com', owner2Pass, 'Viman Nagar, Pune', 'owner']
    );
    console.log('owners created');

    const [owners] = await connection.query('SELECT id, email, name FROM users WHERE role = "owner"');

    await connection.query(
      'INSERT INTO stores (name, email, address, owner_id, owner_name) VALUES (?, ?, ?, ?, ?)',
      ['Starbucks', 'starbucks@stores.com', 'Bavdhan, Pune', owners[0].id, owners[0].name]
    );

    await connection.query(
      'INSERT INTO stores (name, email, address, owner_id, owner_name) VALUES (?, ?, ?, ?, ?)',
      ['Amazon Store', 'amazon@stores.com', 'Viman Nagar, Pune', owners[1].id, owners[1].name]
    );

    await connection.query(
      'INSERT INTO stores (name, email, address, owner_id, owner_name) VALUES (?, ?, ?, ?, ?)',
      ['Best Buy', 'bestbuy@stores.com', '101 Tech St', null, null]
    );
    console.log('stores added');

    const userPass = await bcrypt.hash('User@123', 10);
    await connection.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      ['Test User', 'user@test.com', userPass, '321 User Ln', 'user']
    );
    console.log('test user created');

    const [users] = await connection.query('SELECT id FROM users WHERE role = "user" LIMIT 1');
    const [stores] = await connection.query('SELECT id FROM stores LIMIT 2');

    if (users.length > 0 && stores.length > 0) {
      await connection.query(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
        [users[0].id, stores[0].id, 5]
      );
      if (stores.length > 1) {
        await connection.query(
          'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
          [users[0].id, stores[1].id, 4]
        );
      }
      console.log('ratings added');
    }

    console.log('\nDB initialized successfully');
    console.log('Admin: admin@storerating.com / Admin@123');
    console.log('Owner 1: starbucks@stores.com / Owner@123');
    console.log('Owner 2: amazon@stores.com / Owner@456');
    console.log('User: user@test.com / User@123\n');

  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
