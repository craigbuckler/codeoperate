/*
CodeOperate
HTTP and WebSocket servers
*/

'use strict';

// ----------------------------------------------
// HTTP server

// globals
const
  cfg = global.cfg = require('./lib/config')(__dirname),
  code = global.code = require('./lib/code'),
  express = global.express = require('express'),
  app = express();

// EJS template
app.set('view engine', 'ejs');

// middleware
app.use(require('compression')());
app.use(require('serve-favicon')(cfg.dir.client + 'favicon.ico'));
app.use(express.static(cfg.dir.client, { maxAge: 60000 }));

// routes
app.use('/', require('./lib/routes'));
app.use((req, res) => res.status(404).send('Not found'));

// start server
app.listen(cfg.portHttp, () => console.log(`HTTP server listening on port ${cfg.portHttp}`));


// ----------------------------------------------
// WebSocket server
const
  WebSocket = require('ws'),
  server = new WebSocket.Server({ port: cfg.portWS }),
  editor = {};

console.log(`WebSocket server listening on port : ${cfg.portWS}\n`);

// client connected
server.on('connection', socket => {

  let editId, userId;

  // client message
  socket.on('message', msg => {

    if (editId) broadcast(editId, userId, msg);
    else ({ editId, userId } = register(socket, msg));

  });

  // client disconnected
  socket.on('close', () => ({ editId, userId } = deregister(editId, userId)));

});


// register user
function register(socket, msg) {

  let reg, editId = null, userId = null;

  try {
    reg = JSON.parse(msg);
  }
  catch (e) {
    console.log(e, msg);
  }

  if (reg && reg.type === 'REGISTER') {

    editId = reg.data;
    editor[editId] = editor[editId] || { active: 0, user: [] };

    userId = editor[editId].user.length;
    editor[editId].user.push({ userId, socket, name: 'editor' });
    editor[editId].active++;

    console.log(`register user ${userId} at ${editId} (${editor[editId].active} active)`);

  }

  return { editId, userId };

}

// broadcast message to all other users
function broadcast(editId, userId, msg) {

  if (!editId || !editor[editId]) return;

  editor[editId].user.forEach((user, idx) => {
    if (idx !== userId && user && user.socket.readyState === WebSocket.OPEN) {
      user.socket.send(msg);
    }
  });

}


// deregister user
function deregister(editId, userId) {

  if (editId && editor[editId]) {

    console.log(`deregister user ${userId} at ${editId} (${editor[editId].active - 1} active)`);

    editor[editId].user[userId] = null;
    userId = null;
    editor[editId].active--;

    if (!editor[editId].active) {
      delete editor[editId];
      editId = null;
    }

  }

  return { editId, userId };

}
