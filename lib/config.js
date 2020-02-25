// application configuration
module.exports = (root) => {

  'use strict';

  const
    fs = require('fs'),

    cfg = {
      dev       : process.env.NODE_ENV === 'development',
      portHttp  : process.env.PORTHTTP || 3000,
      saveWait  : 5000,
      listMax   : 20,
      dbConn    : 'mongodb://root:mysecret@coopdb:27017',
      dbName    : 'codeoperate'
    };

  cfg.portWS = process.env.PORTWS || cfg.portHttp + 1;

  cfg.path = {
    cmLib       : '/codemirror/lib/',
    cmMode      : '/codemirror/mode/',
    cmTheme     : '/codemirror/theme/'
  };

  cfg.dir = {
    root,
    client      : `${root}/client/`,
    cmMode      : `${root}/client${cfg.path.cmMode}`,
    cmTheme     : `${root}/client${cfg.path.cmTheme}`
  };

  // CodeMirror modes
  cfg.cmMode = {
    'Markdown'    : 'markdown',
    'HTML'        : 'xml',
    'CSS'         : 'css',
    'Sass'        : 'sass',
    'JavaScript'  : 'javascript'
  };
  cfg.cmModeDefault = 'javascript';

  // CodeMirror themes
  cfg.cmTheme = fs.readdirSync(cfg.dir.cmTheme)
    .filter(fn => fn.endsWith('.css'))
    .map(fn => fn.replace('.css', ''))
    .sort();

  cfg.cmTheme.unshift('default');

  return cfg;

};
