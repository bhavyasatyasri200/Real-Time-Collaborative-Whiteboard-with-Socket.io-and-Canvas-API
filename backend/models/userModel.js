const pool = require("../config/db");

exports.createUser = async (name, email, image) => {

  const result = await pool.query(
    "INSERT INTO users(name,email,image) VALUES($1,$2,$3) RETURNING *",
    [name, email, image]
  );

  return result.rows[0];
};