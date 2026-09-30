const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const router = express.Router();

router.post('/register', async(req, res) => {
    try {
        const { username, fullname, password } = req.body;

        if (!username || !fullname || !password) {
            return res.status(400).json({
                message: 'username, fullname and password are required'
            });
        }

        const existingUser = await pool.query(
            'SELECT uid FROM "User" WHERE username = $1', [username]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                message: 'Username already exists'
            });
        }

        const uid = `U${Date.now()}`;
        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            `INSERT INTO "User" (uid, username, fullname, password, roleid)
             VALUES ($1, $2, $3, $4, $5)`, [
                uid,
                username,
                fullname,
                hashedPassword,
                'ROLE_CUSTOMER'
            ]
        );

        res.status(201).json({
            message: 'Registration successful',
            uid,
            username,
            fullname,
            role: 'CUSTOMER'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

router.post('/login', async(req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: 'username and password are required'
            });
        }

        const result = await pool.query(
            `SELECT u.uid, u.username, u.fullname, u.password, r.rolename
             FROM "User" u
             LEFT JOIN "Role" r ON u.roleid = r.roleid
             WHERE u.username = $1`, [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: 'Invalid username or password'
            });
        }

        const user = result.rows[0];

        const passwordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordValid) {
            return res.status(401).json({
                message: 'Invalid username or password'
            });
        }

        const token = jwt.sign({
                uid: user.uid,
                username: user.username,
                role: user.rolename
            },
            process.env.JWT_SECRET || 'ecommerce_microservices_secret', {
                expiresIn: '1h'
            }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                uid: user.uid,
                username: user.username,
                fullname: user.fullname,
                role: user.rolename
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

module.exports = router;