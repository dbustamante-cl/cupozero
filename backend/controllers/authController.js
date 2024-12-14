const jwt = require('jsonwebtoken'); // Para generar el token JWT
const bcrypt = require('bcrypt');
const pool = require('../db/db');

// Controlador para login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validar campos obligatorios
        if (!email || !password) {
            return res.status(400).json({ message: 'Email y contraseña son obligatorios' });
        }

        // Buscar usuario por email
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userResult.rows[0];

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Validar contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        // Generar token JWT
        const token = jwt.sign(
            {
                id: user.id,
                user_identifier: user.user_identifier,
                role_id: user.role_id,
                first_name: user.first_name, // Incluir first_name en el token
            },
            'SECRET_KEY', // Cambiar por una clave segura en producción
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Inicio de sesión exitoso',
            token,
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Controlador para registro
const registerUser = async (req, res) => {
    try {
        const { tax_id, country_code, first_name, last_name, email, password } = req.body;

        // Validar campos obligatorios
        if (!tax_id || !country_code || !first_name || !last_name || !email || !password) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
        }

        // Validar formato del RUT/DNI (sin puntos ni guiones, solo números)
        const taxIdRegex = /^\d{7,9}$/; // Solo números entre 7 y 9 dígitos
        if (!taxIdRegex.test(tax_id)) {
            return res.status(400).json({ message: 'El RUT/DNI no tiene un formato válido.' });
        }

        // Verificar si el `tax_id` o el `email` ya existen
        const userCheck = await pool.query(
            'SELECT email FROM users WHERE tax_id = $1 OR email = $2',
            [tax_id, email]
        );

        if (userCheck.rows.length > 0) {
            const existingEmail = userCheck.rows[0].email;
            return res.status(400).json({
                message: `RUT/DNI asociado al e-mail: ${existingEmail}. Intente recuperar su contraseña.`,
            });
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generar `user_identifier` basado en el país y el `tax_id`
        const user_identifier = `${country_code}-${tax_id}`;

        // Insertar nuevo usuario en la base de datos
        const result = await pool.query(
            `INSERT INTO users 
             (user_identifier, tax_id, country_code, first_name, last_name, email, password_hash, role_id, created_at, updated_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, 1, NOW(), NOW())
             RETURNING id, email`,
            [user_identifier, tax_id, country_code, first_name, last_name, email, hashedPassword]
        );

        res.status(201).json({
            message: 'Usuario registrado exitosamente.',
            user: {
                id: result.rows[0].id,
                email: result.rows[0].email,
            },
        });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ message: 'Error en el servidor. Inténtelo más tarde.' });
    }
};

module.exports = {
    loginUser,
    registerUser,
};