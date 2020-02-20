// main application

import * as editor from './editor.js';
import * as ws from './wsclient.js';


// user edit
window.addEventListener('edit-CHANGE', e => ws.send('CHANGE', e.detail));

// edit event from another user
window.addEventListener('ws-CHANGE', e => editor.edit(e.detail));
