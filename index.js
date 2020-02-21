/*
CodeOperate
HTTP and WebSocket servers
*/

'use strict';

// ----------------------------------------------
// HTTP server

// globals
const
  cfg = global.cfg = require('./lib/config')(__dirname),
  express = global.express = require('express'),
  app = express();

// EJS template
app.set('view engine', 'ejs');

// middleware
app.use(require('compression')());
app.use(require('serve-favicon')(cfg.dir.client + 'favicon.ico'));
app.use(express.static(cfg.dir.client, { maxAge: 60000 }));

// routes
app.use('/', require('./lib/routes'));
app.use((req, res) => res.status(404).send('Not found'));

// start server
app.listen(cfg.portHttp, () => console.log(`HTTP server listening on port ${cfg.portHttp}`));


// ----------------------------------------------
// WebSocket server
require('./lib/wsconn');
