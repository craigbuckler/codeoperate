/* CodeMirror editor functionality */
/* global cfg CodeMirror */

'use strict';

const
  editorNode  = document.getElementById('editor'),
  titleNode   = document.getElementById('title'),
  modeNode    = document.getElementById('mode'),
  themeNode   = document.getElementById('theme'),

  cm = CodeMirror(editorNode, {
    tabSize: 2,
    lineNumbers: true
  });

// user edit event
cm.on('change', (i, change) => {

  if (change.origin === 'gen') return;

  raiseEvent('CHANGE', {
    text: change.text[0],
    from: { line: change.from.line, ch: change.from.ch },
    to:   { line: change.to.line, ch: change.to.ch }
  });

});

// other user edit event
window.addEventListener('ws-CHANGE', e => {

  let change = e.detail;

  cm.replaceRange(
    change.text,
    change.from,
    change.to,
    'gen'
  );

});

// change title
titleNode.addEventListener('change', e => {
  raiseEvent('TITLE', e.target.value);
});

// set editor mode
setMode(cfg.mode);
modeNode.addEventListener('change', e => setMode(e.target.value));

function setMode(mode) {
  if (mode === cm.getOption('mode')) return;
  modeNode.value = mode;
  cm.setOption('mode', mode);
  raiseEvent('MODE', mode);
}

// set editor theme
setTheme(localStorage.getItem('theme') || 'default');
themeNode.addEventListener('change', e => setTheme(e.target.value));

function setTheme(theme) {
  if (theme === cm.getOption('theme')) return;
  themeNode.value = theme;
  localStorage.setItem('theme', theme);
  cm.setOption('theme', theme);
  raiseEvent('THEME', theme);
}

// raise new custom event
function raiseEvent(type, detail) {
  let event = new CustomEvent(`edit-${type}`, { detail });
  window.dispatchEvent(event);
}
