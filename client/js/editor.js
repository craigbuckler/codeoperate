/* CodeMirror editor functionality */
/* global cfg CodeMirror */

'use strict';

const
  editorNode  = document.getElementById('editor'),
  titleNode   = document.getElementById('title'),
  modeNode    = document.getElementById('mode'),
  themeNode   = document.getElementById('theme'),

  cm = CodeMirror(editorNode, {
    value: cfg.code,
    tabSize: 2,
    lineNumbers: true
  });

// user edit event
cm.on('change', (i, change) => {

  if (change.origin === 'gen') return;

  let text = change.text[0];
  if (change.text.length == 2 && !text && !change.text[1]) text = '\n';

  raiseEvent('CHANGE', {
    text: text.replace(/\t/g,'[\\t]').replace(/\n/g,'[\\n]'),
    from: { line: change.from.line, ch: change.from.ch },
    to:   { line: change.to.line, ch: change.to.ch }
  });

});

// programmatic edit
export function edit(change) {

  cm.replaceRange(
    change.text.replace(/\[\\t\]/g, '\t').replace(/\[\\n\]/g, '\n'),
    change.from,
    change.to,
    'gen'
  );

}

// change title
titleNode.addEventListener('change', e => {
  let title = e.target.value.trim();
  if (title) raiseEvent('TITLE', title);
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
