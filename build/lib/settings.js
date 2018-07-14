'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setSettings = exports.getSetting = exports.getSettings = undefined;

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const db = require.main.require('./src/database');

const p = _bluebird2.default.promisify;
const getObject = p(db.getObject);
const getObjectField = p(db.getObjectField);
const setObject = p(db.setObject);

const convert = {
  checkingInterval: x => parseInt(x, 10) || 1000 * 60 * 5,
  respondIfCanReply: x => x === true || x === 'true',
  mainPostOnly: x => x === true || x === 'true'
};

const getSettings = (() => {
  var _ref = (0, _bluebird.coroutine)(function* () {
    var _ref2 = (yield getObject('plugin-calendar:settings')) || {};

    const checkingInterval = _ref2.checkingInterval,
          respondIfCanReply = _ref2.respondIfCanReply,
          mainPostOnly = _ref2.mainPostOnly;

    return {
      checkingInterval: convert.checkingInterval(checkingInterval),
      respondIfCanReply: convert.respondIfCanReply(respondIfCanReply),
      mainPostOnly: convert.mainPostOnly(mainPostOnly)
    };
  });

  return function getSettings() {
    return _ref.apply(this, arguments);
  };
})();

const setSettings = settings => setObject('plugin-calendar:settings', settings);

const getSetting = (() => {
  var _ref3 = (0, _bluebird.coroutine)(function* (key) {
    const value = yield getObjectField('plugin-calendar:settings', key);
    if (!convert[key]) {
      throw Error('invalid-data');
    }
    return convert[key](value);
  });

  return function getSetting(_x) {
    return _ref3.apply(this, arguments);
  };
})();

exports.getSettings = getSettings;
exports.getSetting = getSetting;
exports.setSettings = setSettings;
//# sourceMappingURL=settings.js.map