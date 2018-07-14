'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.postSaveCallback = exports.postSave = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _validator = require('validator');

var _validator2 = _interopRequireDefault(_validator);

var _parse = require('./parse');

var _parse2 = _interopRequireDefault(_parse);

var _privileges = require('./privileges');

var _event = require('./event');

var _validateEvent3 = require('./validateEvent');

var _validateEvent4 = _interopRequireDefault(_validateEvent3);

var _reminders = require('./reminders');

var _settings = require('./settings');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const plugins = require.main.require('./src/plugins');
const topics = require.main.require('./src/topics');
const winston = require.main.require('winston');

const p = _bluebird2.default.promisify;

const fireHook = p(plugins.fireHook);
const getTopicField = p(topics.getTopicField);

const isMainPost = (() => {
  var _ref = (0, _bluebird.coroutine)(function* (_ref2) {
    let pid = _ref2.pid,
        tid = _ref2.tid;

    const mainPid = yield getTopicField(tid, 'mainPid');
    return parseInt(mainPid, 10) === parseInt(pid, 10);
  });

  return function isMainPost(_x) {
    return _ref.apply(this, arguments);
  };
})();

const postSave = (() => {
  var _ref3 = (0, _bluebird.coroutine)(function* (data) {
    const post = data.post;

    let event = (0, _parse2.default)(post.content);

    // delete event if no longer in post
    if (!post.content.match(_parse.inPost)) {
      const existed = yield (0, _event.eventExists)(post.pid);
      if (existed) {
        yield (0, _reminders.notify)({
          event: yield (0, _event.getEvent)(post.pid),
          message: '[[calendar:event_deleted]]'
        });

        yield (0, _event.deleteEvent)(post.pid);
        winston.verbose(`[plugin-calendar] Event (pid:${post.pid}) deleted`);
      }

      return data;
    }

    const invalid = function invalid() {
      post.content = post.content.replace(/\[(\/?)event\]/g, '[$1event-invalid]');
      return data;
    };

    if (!event) {
      return invalid();
    }

    var _validateEvent = (0, _validateEvent4.default)(event),
        _validateEvent2 = (0, _slicedToArray3.default)(_validateEvent, 2);

    const failed = _validateEvent2[0],
          failures = _validateEvent2[1];

    if (failed) {
      const obj = failures.reduce(function (val, failure) {
        return (0, _extends3.default)({}, val, {
          [failure]: event[failure]
        });
      }, {});
      winston.verbose(`[plugin-calendar] Event (pid:${post.pid}) validation failed: `, obj);
      return invalid();
    }

    const main = post.isMain || data.data.isMain || (yield isMainPost(post));
    if (!main && (yield (0, _settings.getSetting)('mainPostOnly'))) {
      return invalid();
    }

    const can = yield (0, _privileges.canPostEvent)(post.tid, post.uid);
    if (!can) {
      return invalid();
    }

    event.name = _validator2.default.escape(event.name);
    event.location = event.location.trim();
    event.description = event.description.trim();
    event.pid = post.pid;
    event.uid = post.uid;
    event = yield fireHook('filter:plugin-calendar.event.post', event);

    if (event) {
      yield (0, _event.saveEvent)(event);
      winston.verbose(`[plugin-calendar] Event (pid:${event.pid}) saved`);
    }

    return data;
  });

  return function postSave(_x2) {
    return _ref3.apply(this, arguments);
  };
})();

const postSaveCallback = (data, cb) => postSave(data).asCallback(cb);

exports.postSave = postSave;
exports.postSaveCallback = postSaveCallback;
//# sourceMappingURL=postSave.js.map