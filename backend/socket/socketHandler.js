let users = {};

module.exports = (io) => {

  io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    socket.on("joinRoom", ({ boardId, name }) => {

      socket.join(boardId);

      users[socket.id] = {
        id: socket.id,
        name: name || "Anonymous"
      };

      io.to(boardId).emit("roomUsers", {
        users: Object.values(users)
      });

    });

    socket.on("cursorMove", (data) => {

      socket.broadcast.emit("cursorUpdate", {
        userId: socket.id,
        ...data
      });

    });

    socket.on("draw", (data) => {

      socket.broadcast.emit("drawUpdate", data);

    });

    socket.on("addObject", (data) => {

      socket.broadcast.emit("objectAdded", data);

    });

    socket.on("disconnect", () => {

      delete users[socket.id];

      io.emit("roomUsers", {
        users: Object.values(users)
      });

      console.log("User disconnected:", socket.id);
    });

  });

};