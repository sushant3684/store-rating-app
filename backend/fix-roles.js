const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixRoles() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        await connection.execute(
            "UPDATE users SET role='owner' WHERE email IN ('starbucks@stores.com', 'amazon@stores.com', 'testowner@app.com')"
        );

        const [users] = await connection.execute(
            "SELECT email, role FROM users WHERE email LIKE '%store%' OR email LIKE '%owner%'"
        );

        console.log('Updated owner roles:');
        console.table(users);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

fixRoles();
