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

  let p = msg.indexOf(':'), type = '', data = '';

  if (p > 0 && p < msg.length) {
    type = msg.slice(0, p);

    if (!typeMatch || type === typeMatch) {

      try { data = JSON.parse(msg.slice(p+1)); }
      catch (e) { console.log(e, msg); }

    }
  }

  return { type, data };

}


// register user
function register(socket, msg) {

  const
    { data } = parseMessage(msg, 'connect'),
    name = data.operator || 'operator';

  let editId = data.editId, userId;

  if (editId) {

    editor[editId] = editor[editId] || { active: 0, saved: true, user: [] };

    userId = editor[editId].user.length;
    editor[editId].user.push({ userId, socket, name, latest: editor[editId].saved });
    editor[editId].active++;

    // return user ID and current user names
    let userName = editor[editId].user.map(u => u && u.name);
    socket.send(`register:{"userId":${userId},"user":${ JSON.stringify(userName) }}`);

    // broadcast user to others
    broadcast(editId, userId, `operator:"${name}"`);

    console.log(`register user #${userId}, ${name}, at ${editId} (${editor[editId].active} active)`);

  }

  return { editId, userId };
}


// deregister user
function deregister(editId, userId) {

  if (editId && editor[editId]) {

    console.log(`deregister user ${userId} at ${editId} (${editor[editId].active - 1} active)`);

    // broadcast user to others
    broadcast(editId, userId, 'operator:""');

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

  if (!editId || !editor[editId] || !msg) return;

  let save, update;

  if (msg.startsWith('edit:')) {

    // edit message: DB record is obsolete
    editor[editId].saved = false;

  }
  else {

    // other messages
    const { type, data } = parseMessage(msg);

    // save data
    save = (type === 'code');

    if (save || type === 'title' || type === 'mode') {
      update = { [type]: data };
    }
    else if (type === 'operator') {

      // store user name
      editor[editId].user[userId].name = data;

      // add userID to message
      msg = `operator:{"userId":${userId},"operator":"${data}"}`;
    }

  }

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
  if (!update) return;
  (async() => {

    editor[editId].saved = true;
    let saved = await store.update(editId, update);
    editor[editId].saved &= saved;

  })();

}
