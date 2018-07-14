'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.notify = exports.initNotifierDaemon = undefined;

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _responses = require('./responses');

var _event = require('./event');

var _privileges = require('./privileges');

var _repetition = require('./repetition');

var _templates = require('./templates');

var _settings = require('./settings');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const notifications = require.main.require('./src/notifications'); // import { fork } from 'child_process';

const posts = require.main.require('./src/posts');
const meta = require.main.require('./src/meta');
const user = require.main.require('./src/user');
const emailer = require.main.require('./src/emailer');
const nconf = require.main.require('nconf');
const winston = require.main.require('winston');

const p = _bluebird2.default.promisify;

const createNotif = p(notifications.create);
const pushNotif = p(notifications.push);
const getPostFields = p(posts.getPostFields);
const getUidsFromSet = p(user.getUidsFromSet);
const sendEmail = p(emailer.send);
const getUserSettings = p(user.getSettings);
const getUserFields = p(user.getUserFields);

const emailNotification = (() => {
  var _ref = (0, _bluebird.coroutine)(function* (_ref2) {
    let uid = _ref2.uid,
        event = _ref2.event,
        message = _ref2.message;

    if (parseInt(meta.config.disableEmailSubscriptions, 10) === 1) {
      return;
    }

    var _ref3 = yield _bluebird2.default.all([getUserFields(uid, ['username', 'userslug']), getUserSettings(uid), (0, _responses.getUserResponse)({ pid: event.pid, uid: uid, day: event.day })]),
        _ref4 = (0, _slicedToArray3.default)(_ref3, 3);

    const userData = _ref4[0],
          userSettings = _ref4[1],
          response = _ref4[2];


    if (userSettings.sendPostNotifications) {
      const parsed = yield (0, _event.escapeEvent)(event);
      parsed.responses = {
        [uid]: response
      };

      const content = (0, _templates.eventTemplate)({ event: parsed, uid: uid, isEmail: true });

      yield sendEmail('notif_plugin_calendar_event_reminder', uid, {
        pid: event.pid,
        subject: `[${meta.config.title || 'NodeBB'}] ` + `[[calendar:event_starting, ${message}, ${event.name}]]`,
        content: content.replace(/"\/\//g, '"https://'),
        site_title: meta.config.title || 'NodeBB',
        username: userData.username,
        userslug: userData.userslug,
        url: `${nconf.get('url')}/post/${event.pid}`,
        base_url: nconf.get('url')
      });
    }
  });

  return function emailNotification(_x) {
    return _ref.apply(this, arguments);
  };
})();

const notify = (() => {
  var _ref5 = (0, _bluebird.coroutine)(function* (_ref6) {
    let event = _ref6.event,
        reminder = _ref6.reminder,
        message = _ref6.message;

    let uids;

    // if event is mandatory, notify all the users who can view it
    if (event.mandatory) {
      const all = yield getUidsFromSet('users:joindate', 0, -1);
      uids = yield (0, _privileges.filterUidsByPid)(all, event.pid);
    } else {
      let users;

      // if reminder is for the event start
      // notify 'maybe' and 'yes' responders
      // otherwise, notify only 'yes' responders
      if (reminder === 0) {
        const responses = yield (0, _responses.getAll)({
          pid: event.pid,
          selection: ['yes', 'maybe']
        });
        users = [].concat((0, _toConsumableArray3.default)(responses.yes), (0, _toConsumableArray3.default)(responses.maybe));
      } else {
        const responses = yield (0, _responses.getAll)({
          pid: event.pid,
          selection: ['yes']
        });
        users = responses.yes;
      }
      uids = users.map(function (u) {
        return u.uid;
      });
    }

    const postData = yield getPostFields(event.pid, ['tid', 'content', 'title']);

    const notif = yield createNotif({
      bodyShort: `[[calendar:event_starting, ${message}, ${event.name}]]`,
      bodyLong: postData.content,
      nid: `plugin-calendar:events:pid:${event.pid}:event_starting`,
      pid: event.pid,
      tid: postData.tid,
      from: event.uid,
      path: `/post/${event.pid}`
    });
    yield pushNotif(notif, uids);

    yield _bluebird2.default.all(uids.map(function (uid) {
      return emailNotification({ uid: uid, event: event, message: message, postData: postData });
    }));
  });

  return function notify(_x2) {
    return _ref5.apply(this, arguments);
  };
})();

const initNotifierDaemon = (() => {
  var _ref7 = (0, _bluebird.coroutine)(function* () {
    // ms between checking for reminders
    // pulled from settings
    let checkingInterval = yield (0, _settings.getSetting)('checkingInterval');

    winston.verbose(`Notifier Daemon initialized with
    interval of ${Math.floor(checkingInterval / 1000)} seconds`);

    let lastEnd = Date.now() + checkingInterval;

    const checkReminders = (() => {
      var _ref8 = (0, _bluebird.coroutine)(function* () {
        checkingInterval = yield (0, _settings.getSetting)('checkingInterval');
        // timespan we check is a checkingInterval in the future
        // so as to avoid sending notifications too late
        const start = lastEnd;
        const end = Date.now() + checkingInterval;
        lastEnd = end;

        const events = yield (0, _event.getEventsEndingAfter)(start);

        const occurences = events.reduce(function (prev, event) {
          const max = Math.max.apply(Math, [0].concat((0, _toConsumableArray3.default)(event.reminders)));
          if (event.repeats) {
            return [].concat((0, _toConsumableArray3.default)(prev), (0, _toConsumableArray3.default)((0, _repetition.getOccurencesOfRepetition)(event, start, end + max)));
          }
          return [].concat((0, _toConsumableArray3.default)(prev), [event]);
        }, []);

        const filtered = occurences.map(function (event) {
          const reminder = [0].concat((0, _toConsumableArray3.default)(event.reminders)).find(function (r) {
            const remDate = event.startDate - r;
            return remDate > start && remDate <= end;
          });
          if (!Number.isFinite(reminder)) {
            return null;
          }
          const message = `[[moment:time-in, ${event.startDate - start}]]`;
          return { event: event, reminder: reminder, message: message };
        }).filter(Boolean);

        yield _bluebird2.default.all(filtered.map(notify));
      });

      return function checkReminders() {
        return _ref8.apply(this, arguments);
      };
    })();

    const daemon = function daemon() {
      checkReminders().asCallback(function (err) {
        if (err) {
          winston.error(err);
        }
        setTimeout(daemon, checkingInterval);
      });
    };
    daemon();
  });

  return function initNotifierDaemon() {
    return _ref7.apply(this, arguments);
  };
})();

exports.initNotifierDaemon = initNotifierDaemon;
exports.notify = notify;
//# sourceMappingURL=reminders.js.map