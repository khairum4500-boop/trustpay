const express = require('express');
const bodyParser = require('body-parser');
const path = require('path'); // এটি ফাইল পাথ হ্যান্ডেল করার জন্য দরকার
const db = require('./db_handler');
const app = express();

app.use(bodyParser.json());

// ১. এটি নিশ্চিত করবে যে public ফোল্ডারের ভেতর থেকে CSS/JS ফাইলগুলো লোড হবে
app.use(express.static(path.join(__dirname, 'public')));

// ২. হোম পেজ লোড করার লজিক (যাতে Cannot GET / না আসে)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ৩. নিবন্ধন এপিআই
app.post('/api/register', (req, res) => {
    const { phone, password, refer } = req.body;
    const date = new Date().toLocaleDateString('en-GB');
    db.run("INSERT INTO users (phone, password, refer_by, joined_date) VALUES (?, ?, ?, ?)", 
    [phone, password, refer || 'none', date], function(err) {
        if (err) return res.json({ status: 'error', message: "এই নম্বর দিয়ে ইতিমধ্যে অ্যাকাউন্ট আছে!" });
        res.json({ status: 'success', message: "নিবন্ধন সফল!" });
    });
});

// ৪. লগইন এপিআই
app.post('/api/login', (req, res) => {
    const { phone, password } = req.body;
    db.get("SELECT * FROM users WHERE phone = ? AND password = ?", [phone, password], (err, row) => {
        if (row) res.json({ status: 'success', user: row });
        else res.json({ status: 'error', message: "ভুল ফোন নম্বর বা পাসওয়ার্ড!" });
    });
});

// ৫. প্যাকেজ কেনার এপিআই
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

// ৬. অন্য যেকোনো ভুল লিঙ্কে ঢুকলে হোম পেজে নিয়ে যাবে
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000; // Render-এর পোর্টের জন্য এটি জরুরি
app.listen(PORT, () => console.log(`TrustPay Pro running on port ${PORT}`));
