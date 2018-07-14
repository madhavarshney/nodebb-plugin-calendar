'use strict';

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _responses = require('./responses');

var _event = require('./event');

var _privileges = require('./privileges');

var _repetition = require('./repetition');

var _settings = require('./settings');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const privileges = require.main.require('./src/privileges');
const pluginSockets = require.main.require('./src/socket.io/plugins');
const posts = require.main.require('./src/posts');
const topics = require.main.require('./src/topics');

const p = _bluebird2.default.promisify;

const can = {
  posts: p(privileges.posts.can),
  topics: p(privileges.topics.can),
  categories: p(privileges.categories.can)
};
const tidFromPid = p((pid, cb) => posts.getPostField(pid, 'tid', cb));
const topicIsDeleted = p((tid, cb) => topics.getTopicField(tid, 'deleted', cb));

pluginSockets.calendar = {};
pluginSockets.calendar.canPostEvent = (sock, data, cb) => {
  (() => {
    var _ref = (0, _bluebird.coroutine)(function* (_ref2, _ref3) {
      let uid = _ref2.uid;
      let pid = _ref3.pid,
          tid = _ref3.tid,
          cid = _ref3.cid,
          isMain = _ref3.isMain;

      if (!isMain && (yield (0, _settings.getSetting)('mainPostOnly'))) {
        return false;
      }

      if (pid) {
        return can.posts(_privileges.privilegeNames.canPost, pid, uid);
      }
      if (tid) {
        return can.topics(_privileges.privilegeNames.canPost, tid, uid);
      }
      if (cid) {
        return can.categories(_privileges.privilegeNames.canPost, cid, uid);
      }
      return false;
    });

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  })()(sock, data).asCallback(cb);
};

pluginSockets.calendar.getResponses = (_ref4, _ref5, cb) => {
  let uid = _ref4.uid;
  let pid = _ref5.pid,
      day = _ref5.day;

  (0, _responses.getAll)({ uid: uid, pid: pid, day: day }).asCallback(cb);
};

pluginSockets.calendar.submitResponse = function (_ref6) {
  let uid = _ref6.uid;

  var _ref7 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  let pid = _ref7.pid,
      value = _ref7.value,
      day = _ref7.day;
  let cb = arguments[2];

  (0, _responses.submitResponse)({ uid: uid, pid: pid, value: value, day: day }).asCallback(cb);
};

pluginSockets.calendar.getUserResponse = (_ref8, _ref9, cb) => {
  let uid = _ref8.uid;
  let pid = _ref9.pid,
      day = _ref9.day;

  (0, _responses.getUserResponse)({ uid: uid, pid: pid, day: day }).asCallback(cb);
};

pluginSockets.calendar.getEventsByDate = (sock, data, cb) => {
  (() => {
    var _ref10 = (0, _bluebird.coroutine)(function* (_ref11, _ref12) {
      let uid = _ref11.uid;
      let startDate = _ref12.startDate,
          endDate = _ref12.endDate;

      const events = yield (0, _event.getEventsByDate)(startDate, endDate);
      const filtered = yield (0, _privileges.filterByPid)(events, uid);
      const occurences = filtered.reduce(function (prev, event) {
        if (event.repeats && event.repeats.every) {
          return [].concat((0, _toConsumableArray3.default)(prev), (0, _toConsumableArray3.default)((0, _repetition.getOccurencesOfRepetition)(event, startDate, endDate)));
        }
        return [].concat((0, _toConsumableArray3.default)(prev), [event]);
      }, []);
      const withResponses = yield _bluebird2.default.all(occurences.map((() => {
        var _ref13 = (0, _bluebird.coroutine)(function* (event) {
          const day = event.day;

          var _ref14 = yield _bluebird2.default.all([(0, _responses.getUserResponse)({ pid: event.pid, uid: uid, day: day }).catch(function () {
            return null;
          }), tidFromPid(event.pid).then(topicIsDeleted), (0, _event.escapeEvent)(event)]),
              _ref15 = (0, _slicedToArray3.default)(_ref14, 3);

          const response = _ref15[0],
                topicDeleted = _ref15[1],
                escaped = _ref15[2];

          return (0, _extends3.default)({}, escaped, {
            responses: {
              [uid]: response
            },
            topicDeleted: !!parseInt(topicDeleted, 10)
          });
        });

        return function (_x6) {
          return _ref13.apply(this, arguments);
        };
      })()));

      return withResponses;
    });

    return function (_x4, _x5) {
      return _ref10.apply(this, arguments);
    };
  })()(sock, data).asCallback(cb);
};
//# sourceMappingURL=sockets.js.map