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
export function send(type = '', data = '') {

  if (!socket) init(type, data);
  else socket.send(`${ type }:${ JSON.stringify(data) }`);

}


// parse incoming WebSocket message and raise custom event
function receive(msg) {

  let p = msg.indexOf(':'), type = '', data = '';

  if (p > 0 && p < msg.length) {
    type = msg.slice(0, p);

    try { data = JSON.parse(msg.slice(p+1)); }
    catch (e) { console.log(e, msg); }

  }

  if (type && data) {

    // raise custom event
    let event = new CustomEvent(`ws:${type}`, { detail: data || {} });
    window.dispatchEvent(event);

  }

}
