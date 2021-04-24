/* eslint-disable no-param-reassign */
module.exports = (client) => {
  client.regexCount = (regexp, str) => {
    if (typeof regexp !== 'string') {
      return 0;
    }
    regexp = regexp === '.' ? `\\${regexp}` : regexp;
    regexp = regexp === '' ? '.' : regexp;
    return ((str || '').match(new RegExp(regexp, 'g')) || []).length;
  };
};
