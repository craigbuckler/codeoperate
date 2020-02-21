// main application
import * as editor from './editor.js';
import * as ws from './wsclient.js';

// delay before uploading all data
const saveWait = cfg.saveWait;
let save = null;


// need to refactor!
// only set ALL if page has been loaded since the previous update

// abort save
function saveAbort() {
  clearTimeout(save);
  save = null;
}

// unloading window
window.addEventListener('beforeunload', () => {
  saveAbort();
  saveAll();
});


// user edit - broadcast
window.addEventListener('cmEDIT', e => {
  ws.send('EDIT', e.detail);
  saveAbort();
  save = setTimeout(saveAll, saveWait);
});


// incoming edit
window.addEventListener('wsEDIT', e => {
  saveAbort();
  editor.edit(e.detail);
});


// send all content
function saveAll() {
  console.log('send ALL');
  saveAbort();
  ws.send('SAVE', editor.get());
}


// incoming all content
window.addEventListener('wsSAVE', e => {
  if (save) return;
  saveAbort();
  console.log('receive ALL');
  editor.set(e.detail);
});
