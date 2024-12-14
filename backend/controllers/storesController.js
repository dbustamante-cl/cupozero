const pool = require("../db/db"); // Conexión a la base de datos

// Obtener todas las tiendas (predefinidas y personalizadas)
const getStores = async (req, res) => {
    const { user_id } = req.query;
  
    try {
      // Consulta SQL combinada para tiendas predefinidas y personalizadas
      const query = `
          -- Tiendas predefinidas
          SELECT 
              s.id AS store_id,
              s.name,
              s.logo_url,
              s.color_code,
              'false' AS is_custom,
              COALESCE(us.status, 'false')::text AS status
          FROM stores s
          LEFT JOIN user_stores us 
              ON s.id = us.store_id AND us.user_id = $1
          WHERE s.id != -1 -- Excluir la tienda con ID -1
  
          UNION ALL
  
          -- Tiendas personalizadas
          SELECT 
              cs.id AS store_id,
              cs.name,
              NULL AS logo_url, -- Las tarjetas personalizadas no tendrán logo
              cs.color_code,
              'true' AS is_custom,
              COALESCE(us.status, 'false')::text AS status
          FROM custom_stores cs
          LEFT JOIN user_stores us 
              ON cs.id = us.custom_store_id AND us.user_id = $1
          WHERE cs.id != -1; -- Excluir la tienda personalizada con ID -1
      `;
  
      const result = await pool.query(query, [user_id]);
  
      console.log("Tiendas combinadas:", result.rows);
      res.json(result.rows);
    } catch (error) {
      console.error("Error al obtener tiendas:", error);
      res.status(500).json({ message: "Error al obtener tiendas." });
    }
  };

// Crear una tienda nueva (predefinida o personalizada)
const createStore = async (req, res) => {
    const { user_id, name, logo_url, color_code, is_custom } = req.body;

    console.log("Datos recibidos en createStore:", req.body);

    if (!name) {
        return res.status(400).json({ message: "El nombre de la tienda es obligatorio." });
    }

    try {
        let storeId = null;
        let customStoreId = null;

        if (is_custom === "true") {
            // Crear una tienda personalizada
            const result = await pool.query(
                `INSERT INTO custom_stores (user_id, name, logo_url, color_code, created_at, updated_at)
                VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id`,
                [user_id, name, logo_url || null, color_code || null]
            );
            customStoreId = result.rows[0].id;
        } else {
            // Crear una tienda predefinida
            const result = await pool.query(
                `INSERT INTO stores (name, logo_url, color_code, created_at)
                VALUES ($1, $2, $3, NOW()) RETURNING id`,
                [name, logo_url || null, color_code || null]
            );
            storeId = result.rows[0].id;
        }

        // Asociar la tienda al usuario
        if (user_id) {
            await pool.query(
                `INSERT INTO user_stores (user_id, store_id, custom_store_id, status, created_at, updated_at)
                VALUES ($1, $2, $3, true, NOW(), NOW())`,
                [user_id, storeId || null, customStoreId || null]
            );
        }

        res.status(201).json({
            message: "Tienda creada exitosamente",
            storeId,
            customStoreId,
        });
    } catch (error) {
        console.error("Error al crear la tienda:", error);
        res.status(500).json({ message: "Error al crear la tienda." });
    }
};

module.exports = {
  getStores,
  createStore,
};