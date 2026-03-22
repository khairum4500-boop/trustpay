const db = require('./db_handler');

exports.register = (req, res) => {
    const { phone, password } = req.body;
    const date = new Date().toLocaleDateString();
    db.run("INSERT INTO users (phone, password, joined_date) VALUES (?, ?, ?)", [phone, password, date], function(err) {
        if (err) return res.json({ status: 'error', message: "এই নম্বরটি ইতিমধ্যে নিবন্ধিত!" });
        res.json({ status: 'success' });
    });
};

exports.login = (req, res) => {
    const { phone, password } = req.body;
    db.get("SELECT * FROM users WHERE phone = ? AND password = ?", [phone, password], (err, row) => {
        if (row) {
            res.json({ status: 'success', user: row });
        } else {
            res.json({ status: 'error', message: "ভুল নম্বর বা পাসওয়ার্ড!" });
        }
    });
};
