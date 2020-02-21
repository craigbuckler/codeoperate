// Express.js routing
/* global cfg express */

'use strict';

const
  lib = require('./lib'),
  code = require('./code'),
  router = express.Router();

// new
router.get('/new', async (req, res) => {

  const id = await code.add();

  if (id) {
    res.redirect(`/${id}`);
  }
  else {
    res.status(500).send('unable to create code record');
  }

});


// editor
router.get('/[a-f0-9]{24}', async (req, res, next) => {

  // code ID
  const
    id = req.path.slice(1),
    edit = await code.fetch(id);

  if (edit) {

    // recorded code found
    cfg.hostname = req.headers.host.replace(/:\d+$/, '');
    edit.code    = edit.code.replace(/`/g, '\\`');
    edit.created = lib.formatDate(edit.created);
    edit.updated = lib.formatDate(edit.updated);

    res.render('editor', { cfg, edit });

  }
  else {

    // code not found
    next();

  }

});


// home page
router.get('/', (req, res) => {
  res.render('index');
});


// export
module.exports = router;
