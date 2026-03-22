const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./trustpay_final.db');

db.serialize(() => {
    // ইউজার টেবিল: ব্যালেন্স, পাসওয়ার্ড এবং রেফারেল সহ
    db.run(`CREATE TABLE IF NOT EXISTS users (
        uid INTEGER PRIMARY KEY AUTOINCREMENT, 
        phone TEXT UNIQUE, 
        password TEXT,
        balance REAL DEFAULT 0.0,
        total_deposit REAL DEFAULT 0.0,
        total_withdraw REAL DEFAULT 0.0,
        refer_by TEXT,
        refer_count INTEGER DEFAULT 0,
        joined_date TEXT
    )`);

    // ইনভেস্টমেন্ট প্ল্যান টেবিল
    db.run(`CREATE TABLE IF NOT EXISTS active_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_phone TEXT,
        plan_name TEXT,
        daily_income REAL,
        expiry_date TEXT,
        status TEXT DEFAULT 'active'
    )`);

    // ডিপোজিট হিস্ট্রি
    db.run(`CREATE TABLE IF NOT EXISTS deposits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone TEXT,
        amount REAL,
        method TEXT,
        trxid TEXT,
        status TEXT DEFAULT 'pending',
        date TEXT
    )`);
});

module.exports = db;
