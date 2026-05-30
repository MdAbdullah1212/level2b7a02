import { pool } from "../../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const registration = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existing = await pool.query("SELECT * FROM users WHERE email=$1", [
            email,
        ]);
        if (existing.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(`INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at, updated_at`, [name, email, hashedPassword, role || "contributor"]);
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: result.rows[0],
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await pool.query("SELECT * FROM users WHERE email=$1", [
            email,
        ]);
        if (result.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
            });
        }
        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
            });
        }
        const token = jwt.sign({
            id: user.id,
            name: user.name,
            role: user.role,
        }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.json({
            success: true,
            message: "Login successful",
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            },
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
export const authController = {
    registration, login,
};
//# sourceMappingURL=auth.controller.js.map