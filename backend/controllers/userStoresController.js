const pool = require("../db/db"); // Conexión con la base de datos

// Asociar una tienda a un usuario
const addStoreToUser = async (req, res) => {
  const { user_id, store_id, status, name, logo_url, color_code } = req.body;

  try {
    if (store_id) {
      // Tienda comercial: Verificar si ya existe
      const existingRelation = await pool.query(
        "SELECT * FROM user_stores WHERE user_id = $1 AND store_id = $2",
        [user_id, store_id]
      );

      if (existingRelation.rowCount > 0) {
        // Actualizar estado si ya existe
        await pool.query(
          "UPDATE user_stores SET status = $1, updated_at = NOW() WHERE user_id = $2 AND store_id = $3",
          [status, user_id, store_id]
        );
        return res.status(200).json({ message: "Estado actualizado correctamente" });
      }

      // Crear nueva relación si no existe
      await pool.query(
        "INSERT INTO user_stores (user_id, store_id, status, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())",
        [user_id, store_id, status]
      );
    } else if (name) {
      // Manejo de Tienda Personalizada (Tarjeta Bancaria)
      let customStoreId;

      // Verificar si la tienda personalizada ya existe
      const existingCustomStore = await pool.query(
        "SELECT id FROM custom_stores WHERE user_id = $1 AND name = $2",
        [user_id, name]
      );

      if (existingCustomStore.rowCount > 0) {
        // Si ya existe, obtener su ID
        customStoreId = existingCustomStore.rows[0].id;
      } else {
        // Crear una nueva entrada en custom_stores
        const customStoreResult = await pool.query(
          `INSERT INTO custom_stores (user_id, name, logo_url, color_code, created_at, updated_at)
           VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id`,
          [user_id, name, logo_url || null, color_code || null]
        );
        customStoreId = customStoreResult.rows[0].id;
      }

      // Crear la relación en user_stores con el custom_store_id
      const relationResult = await pool.query(
        "INSERT INTO user_stores (user_id, custom_store_id, status, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *",
        [user_id, customStoreId, status]
      );

      return res.status(201).json({
        message: "Tienda personalizada asociada exitosamente",
        userStore: relationResult.rows[0],
      });
    }

    res.status(201).json({ message: "Tienda asociada exitosamente" });
  } catch (error) {
    console.error("Error al asociar tienda al usuario:", error);
    res.status(500).json({ message: "Error al asociar tienda" });
  }
};

// Obtener todas las tiendas asociadas a un usuario
const getUserStores = async (req, res) => {
  const { user_id } = req.query;

  try {
    const result = await pool.query(
      `
      SELECT 
        us.status,
        COALESCE(s.id, cs.id) AS store_id,
        COALESCE(s.name, cs.name) AS name,
        COALESCE(s.logo_url, NULL) AS logo_url, 
        COALESCE(s.color_code, cs.color_code) AS color_code,
        cs.id AS custom_store_id, -- Asegúrate de incluir custom_store_id
        CASE WHEN cs.id IS NOT NULL THEN 'true' ELSE 'false' END AS is_custom
      FROM user_stores us
      LEFT JOIN stores s ON us.store_id = s.id
      LEFT JOIN custom_stores cs ON us.custom_store_id = cs.id
      WHERE us.user_id = $1
      `,
      [user_id]
    );

    console.log("Resultados del backend:", result.rows); // Agrega este log
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener tiendas del usuario:", error);
    res.status(500).json({ message: "Error al obtener tiendas" });
  }
};

// Actualizar el estado de una tienda asociada
const updateStoreStatus = async (req, res) => {
  const { user_id, store_id, custom_store_id, status } = req.body;

  // Validar parámetros requeridos
  if (!user_id) {
    return res.status(400).json({ message: "El user_id es obligatorio." });
  }
  if (!store_id && !custom_store_id) {
    return res.status(400).json({ message: "Se requiere store_id o custom_store_id." });
  }

  try {
    let query = "";
    let values = [];
    let result;

    // Verificar si existe la relación en `user_stores`
    let existingRelation;
    if (store_id) {
      existingRelation = await pool.query(
        `SELECT * FROM user_stores WHERE user_id = $1 AND store_id = $2`,
        [user_id, store_id]
      );
    } else if (custom_store_id) {
      existingRelation = await pool.query(
        `SELECT * FROM user_stores WHERE user_id = $1 AND custom_store_id = $2`,
        [user_id, custom_store_id]
      );
    }

    if (existingRelation && existingRelation.rowCount > 0) {
      // Si la relación existe, actualizar su estado
      if (store_id) {
        query = `
          UPDATE user_stores
          SET status = $1, updated_at = NOW()
          WHERE user_id = $2 AND store_id = $3
          RETURNING *`;
        values = [status === true || status === "true", user_id, store_id];
      } else if (custom_store_id) {
        query = `
          UPDATE user_stores
          SET status = $1, updated_at = NOW()
          WHERE user_id = $2 AND custom_store_id = $3
          RETURNING *`;
        values = [status === true || status === "true", user_id, custom_store_id];
      }
    } else {
      // Si no existe la relación, crearla
      if (store_id) {
        query = `
          INSERT INTO user_stores (user_id, store_id, status, created_at, updated_at)
          VALUES ($1, $2, $3, NOW(), NOW())
          RETURNING *`;
        values = [user_id, store_id, status === true || status === "true"];
      } else if (custom_store_id) {
        query = `
          INSERT INTO user_stores (user_id, custom_store_id, status, created_at, updated_at)
          VALUES ($1, $2, $3, NOW(), NOW())
          RETURNING *`;
        values = [user_id, custom_store_id, status === true || status === "true"];
      }
    }

    // Ejecutar la consulta
    result = await pool.query(query, values);

    res.json({
      message: existingRelation && existingRelation.rowCount > 0 
        ? "Estado actualizado exitosamente" 
        : "Relación creada y activada exitosamente",
      userStore: result.rows[0],
    });
  } catch (error) {
    console.error("Error al actualizar o crear relación de tienda:", error);
    res.status(500).json({ message: "Error al actualizar o crear relación." });
  }
};

module.exports = {
  addStoreToUser,
  getUserStores,
  updateStoreStatus,
};