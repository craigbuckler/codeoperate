// helper functions

// pad a string
function pad(str, len = 2, chr = '0') {
  return String(str).padStart(len, chr);
}

// format a date
function formatDate(d, noTime) {
  return (d instanceof Date ?
    d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) +
    (noTime ? '' : ' ' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()))
    : ''
  );
}


module.exports = {
  pad,
  formatDate
};
