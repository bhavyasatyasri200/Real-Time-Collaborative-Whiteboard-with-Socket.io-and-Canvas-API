const pool = require("../config/db");

exports.getBoardById = async (id) => {

  const result = await pool.query(
    "SELECT * FROM boards WHERE id=$1",
    [id]
  );

  return result.rows[0];
};