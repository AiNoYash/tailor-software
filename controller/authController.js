const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');


const login = async (req, res) => {
    try {
        const { mobile_no, password, role } = req.body;

        // Validate required fields
        if (!mobile_no || !password || !role) {
            return res.status(400).json({ message: 'Mobile number, password, and role are required' });
        }

        // Validate role
        if (!['admin', 'worker'].includes(role)) {
            return res.status(400).json({ message: 'Role must be either admin or worker' });
        }

        // Find user by mobile number and role
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE mobile_no = ? AND role = ?',
            [mobile_no, role]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = rows[0];

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Sign JWT
        const token = jwt.sign(
            { id: user.id, name: user.name, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '12h' }
        );

        return res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                mobile_no: user.mobile_no,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { login };
