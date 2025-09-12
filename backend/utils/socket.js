let io;

function initSocket(server) {
  const socketIo = require('socket.io')(server, { cors: { origin: '*' } });
  io = socketIo;

  io.on('connection', (socket) => {
    console.log('Client connected', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected', socket.id);
    });
  });

  return io;
}

function getIo() {
  if (!io) {
    throw new Error('Socket.io not initialized! Call initSocket(server) first.');
  }
  return io;
}

module.exports = { initSocket, getIo };
