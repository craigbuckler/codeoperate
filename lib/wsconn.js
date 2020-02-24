// WebSocket server
/* global cfg */

'use strict';

const
  store = require('./store'),

  WebSocket = require('ws'),
  server = new WebSocket.Server({ port: cfg.portWS }),
  editor = {};

console.log(`WebSocket server listening on port : ${cfg.portWS}\n`);

// client connected
server.on('connection', socket => {

  let editId, userId;

  // client message received
  socket.on('message', msg => {

    if (editId) broadcast(editId, userId, msg);
    else ({ editId, userId } = register(socket, msg));

  });

  // client disconnected
  socket.on('close', () => ({ editId, userId } = deregister(editId, userId)));

});


// parse incoming message (TYPEjson string)
function parseMessage(msg = '', typeMatch) {

  let type = msg.slice(0, 4), data = '';

  if (!typeMatch || type === typeMatch) {

    try { data = JSON.parse(msg.slice(4)); }
    catch (e) { console.log(e, msg); }

  }

  return { type, data };

}


// register user
function register(socket, msg) {

  const
    { data } = parseMessage(msg, 'CONN'),
    name = data.operator || 'operator';

  let editId = data.editId, userId;

  if (editId) {

    editor[editId] = editor[editId] || { active: 0, saved: true, user: [] };

    userId = editor[editId].user.length;
    editor[editId].user.push({ userId, socket, name, latest: editor[editId].saved });
    editor[editId].active++;

    console.log(`register user #${userId}, ${name}, at ${editId} (${editor[editId].active} active)`);

  }

  return { editId, userId };
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


// broadcast message to all other users
function broadcast(editId, userId, msg) {

  if (!editId || !editor[editId]) return;

  let
    type = msg.slice(0, 4),
    save = (type === 'SAVE');

  // DB record is dirty
  if (type === 'EDIT') editor[editId].saved = false;

  // broadcast message
  editor[editId].user.forEach((user, idx) => {
    if (
      idx !== userId && user && user.socket.readyState === WebSocket.OPEN &&
      (!save || !user.latest)
    ) {
      user.socket.send(msg);
      if (save) user.latest = true;
    }
  });

  // store all data
  if (!save) return;
  (async() => {

    editor[editId].saved = true;
    let saved = await store.update(editId, { code: parseMessage(msg).data });
    editor[editId].saved &= saved;

  })();

}
