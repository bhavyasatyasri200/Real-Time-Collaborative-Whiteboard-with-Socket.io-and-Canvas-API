const pool = require("../config/db");
const { randomUUID } = require("crypto");

exports.createBoard = async (req, res) => {

  const boardId = randomUUID();

  await pool.query(
    "INSERT INTO boards(id, objects) VALUES($1,$2)",
    [boardId, []]
  );

  res.status(201).json({
    boardId
  });
};

exports.saveBoard = async (req, res) => {

  const { boardId } = req.params;
  const { objects } = req.body;

  await pool.query(
    "UPDATE boards SET objects=$1, updated_at=NOW() WHERE id=$2",
    [JSON.stringify(objects), boardId]
  );

  res.json({
    success: true,
    boardId
  });
};

exports.getBoard = async (req, res) => {

  const { boardId } = req.params;

  const result = await pool.query(
    "SELECT * FROM boards WHERE id=$1",
    [boardId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Board not found" });
  }

  res.json(result.rows[0]);
};