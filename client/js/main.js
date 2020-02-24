// main application
/* global cfg */
import * as editor from './editor.js';
import * as ws from './wsclient.js';

// JS enabled
document.documentElement.classList.add('jsenabled');

// register this user
ws.send('connect', { editId: cfg.editId, operator: editor.getOption('operator') });


// registration event
window.addEventListener('ws:register', e => {
  editor.setOperators(e.detail.userId, e.detail.user);
});


// add/remove user
window.addEventListener('ws:operator', e => {
  editor.addOperator(e.detail.userId, e.detail.operator);
});


// rename user
window.addEventListener('cm:operator', e => {
  ws.send('operator', e.detail);
});


// code editing events
let save;
window.addEventListener('beforeunload', editCode);
window.addEventListener('cm:edit', editCode);
window.addEventListener('ws:edit', editCode);
window.addEventListener('ws:code', editCode);

function editCode(e) {

  // unloading: save all content
  if (e.type === 'beforeunload' && save) saveAll();

  clearTimeout(save);
  save = null;

  switch (e.type) {

    // user edit, with throttled save
    case 'cm:edit':
      ws.send('edit', e.detail);
      save = setTimeout(saveAll, cfg.saveWait);
      break;

    // incoming edit
    case 'ws:edit':
      editor.edit(e.detail);
      break;

    // incoming saved content
    case 'cm:code':
      editor.set(e.detail);
      break;

  }

  // send all content
  function saveAll() {
    ws.send('code', editor.get());
  }

}


// option events
window.addEventListener('cm:title', editOption);
window.addEventListener('ws:title', editOption);
window.addEventListener('cm:mode', editOption);
window.addEventListener('ws:mode', editOption);

function editOption(e) {

  let
    type = e.type,
    from = type.slice(0, 2),
    opt = type.slice(3);

  if (from === 'cm') ws.send(opt, e.detail);
  else editor.setOption(opt, e.detail);

}
