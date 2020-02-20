/* WebSocket client */
/* global cfg */

'use strict';

let socket = null;

// initiate WebSocket connection
function init(type, data) {

  if (socket) return false;
  socket = new WebSocket(cfg.wsURL);

  // client start
  socket.addEventListener('open', () => send(type, data));

  // client close
  socket.addEventListener('close', () => socket = null);

  // receive message
  socket.addEventListener('message', evt => receive(evt.data));

}


// send WebSocket message
export function send(type, data) {

  if (!socket) init(type, data);
  else socket.send(`{"type":"${ type }","data":${ JSON.stringify(data) }}`);

}


// parse incoming WebSocket message and raise custom event
function receive(msg) {

  let obj;
  try {
    obj = JSON.parse(msg);
  }
  catch (e) { console.log(e); }

  if (!obj || !obj.type) return;

  // custom event
  let event = new CustomEvent(`ws-${obj.type}`, { detail: obj.data || {} });
  window.dispatchEvent(event);

}

// register user
send('REGISTER', cfg.id);
