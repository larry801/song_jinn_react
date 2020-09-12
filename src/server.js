const Server = require('boardgame.io/dist/server').Server;
const server = Server({ games: [require('./auto/game').SongJinn] });
server.run(8233);
