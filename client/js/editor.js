/* CodeMirror editor functionality */
/* global cfg CodeMirror */

'use strict';

const
  editorNode    = document.getElementById('editor'),
  titleNode     = document.getElementById('title'),
  modeNode      = document.getElementById('mode'),
  themeNode     = document.getElementById('theme'),
  operatorNode  = document.getElementById('operator'),

  cm = CodeMirror(editorNode, {
    value: cfg.code,
    tabSize: 2,
    lineNumbers: true
  });


// encode whitespace
function encodeSpace(str) {
  return str.replace(/\t/g, '[\\t]').replace(/\n/g, '[\\n]');
}


// decode whitespace
function decodeSpace(str) {
  return str.replace(/\[\\t\]/g, '\t').replace(/\[\\n\]/g, '\n');
}


// fetch all content
export function get() {
  return cm.getValue();
}


// set all content
export function set(content) {
  cm.setValue(content);
}


// user edit event
cm.on('change', (i, change) => {

  if (change.origin === 'gen' || change.origin === 'setValue') return;

  let text = change.text[0];
  if (change.text.length == 2 && !text && !change.text[1]) text = '\n';

  raiseEvent('EDIT', {
    text: encodeSpace(text),
    from: { line: change.from.line, ch: change.from.ch },
    to:   { line: change.to.line, ch: change.to.ch }
  });

});

// programmatic edit
export function edit(change) {

  cm.replaceRange(
    decodeSpace(change.text),
    change.from,
    change.to,
    'gen'
  );

}

// change title
titleNode.addEventListener('change', e => {
  let title = e.target.value.trim();
  if (title) raiseEvent('TITL', title);
});

// set editor mode
setMode(cfg.mode);
modeNode.addEventListener('change', e => setMode(e.target.value));

export function setMode(mode) {
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
  raiseEvent('THME', theme);
}

// set operator name
setOperator(localStorage.getItem('operator') || 'operator');
operatorNode.addEventListener('change', e => setOperator(e.target.value));

export function setOperator(operator) {
  if (operator === cfg.operator) return;
  cfg.operator = operator;
  operatorNode.value = operator;
  localStorage.setItem('operator', operator);
  raiseEvent('USER', operator);
}


// raise new custom event
function raiseEvent(type, detail) {
  let event = new CustomEvent(`cm${type}`, { detail });
  window.dispatchEvent(event);
}
