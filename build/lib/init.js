'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _bluebird = require('bluebird');

var _controllers = require('./controllers');

var _controllers2 = _interopRequireDefault(_controllers);

var _reminders = require('./reminders');

var _settings = require('./settings');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const shallowEqual = (a, b) => Object.keys(a).every(key => a[key] === b[key]);

exports.default = (_ref, callback) => {
  let router = _ref.router,
      middleware = _ref.middleware;

  (0, _controllers2.default)(router, middleware);

  const defaults = {
    checkingInterval: 1000 * 60 * 5,
    mainPostOnly: false,
    respondIfCanReply: false
  };
  (0, _bluebird.coroutine)(function* () {
    const old = yield (0, _settings.getSettings)();
    const settings = (0, _extends3.default)({}, defaults, old);

    const changed = !shallowEqual(settings, old);
    if (changed) {
      yield (0, _settings.setSettings)(settings);
    }

    yield (0, _reminders.initNotifierDaemon)();
  })().asCallback(callback);
};
//# sourceMappingURL=init.js.map