// routing
/* global cfg express */

'use strict';

const
  code = require('./code'),
  lib = require('./lib'),
  router = express.Router();


// new
router.get('/new', async (req, res, next) => {

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

  console.log(id);
  console.log(edit);

  if (edit) {

    cfg.hostname = req.headers.host.replace(/:\d+$/, '');
    edit.created = lib.formatDate(edit.created);
    edit.updated = lib.formatDate(edit.updated);

    res.render('pages/editor', { cfg, edit });

  }
  else {
    next();
  }

});


// home page
router.get('/', (req, res) => {
  res.render('pages/index');
});


// export
module.exports = router;
