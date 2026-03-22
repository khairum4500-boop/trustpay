const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db_handler');
const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));

// নিবন্ধন এপিআই
app.post('/api/register', (req, res) => {
    const { phone, password, refer } = req.body;
    const date = new Date().toLocaleDateString('en-GB');
    db.run("INSERT INTO users (phone, password, refer_by, joined_date) VALUES (?, ?, ?, ?)", 
    [phone, password, refer || 'none', date], function(err) {
        if (err) return res.json({ status: 'error', message: "এই নম্বর দিয়ে ইতিমধ্যে অ্যাকাউন্ট আছে!" });
        res.json({ status: 'success', message: "নিবন্ধন সফল!" });
    });
});

// লগইন এপিআই
app.post('/api/login', (req, res) => {
    const { phone, password } = req.body;
    db.get("SELECT * FROM users WHERE phone = ? AND password = ?", [phone, password], (err, row) => {
        if (row) res.json({ status: 'success', user: row });
        else res.json({ status: 'error', message: "ভুল ফোন নম্বর বা পাসওয়ার্ড!" });
    });
});

// প্যাকেজ কেনার এপিআই (সার্ভার সাইড ভ্যালিডেশন)
app.post('/api/buy-package', (req, res) => {
    const { phone, planName, price, dailyIncome } = req.body;
    db.get("SELECT balance FROM users WHERE phone = ?", [phone], (err, row) => {
        if (row && row.balance >= price) {
            const newBalance = row.balance - price;
            db.run("UPDATE users SET balance = ? WHERE phone = ?", [newBalance, phone]);
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + 30);
            db.run("INSERT INTO active_plans (user_phone, plan_name, daily_income, expiry_date) VALUES (?, ?, ?, ?)",
            [phone, planName, dailyIncome, expiry.toLocaleDateString('en-GB')]);
            res.json({ status: 'success', newBalance });
        } else {
            res.json({ status: 'error', message: "ব্যালেন্স পর্যাপ্ত নয়!" });
        }
    });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`TrustPay Pro running on port ${PORT}`));
