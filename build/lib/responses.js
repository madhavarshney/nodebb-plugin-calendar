'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getUserResponse = exports.getAll = exports.removeAll = exports.submitResponse = undefined;

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _privileges = require('./privileges');

var _event = require('./event');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const db = require.main.require('./src/database');
const user = require.main.require('./src/user');

const p = _bluebird2.default.promisify;

const setAdd = p(db.setAdd);
const setsRemove = p(db.setsRemove);
const deleteAll = p(db.deleteAll);
const getSetsMembers = p(db.getSetsMembers);
const isSetMember = p(db.isSetMember);
const getUsersFields = p(user.getUsersFields);

const values = ['yes', 'maybe', 'no'];

const submitResponse = (() => {
  var _ref = (0, _bluebird.coroutine)(function* (_ref2) {
    let pid = _ref2.pid,
        uid = _ref2.uid,
        value = _ref2.value,
        day = _ref2.day;

    if (!values.includes(value)) {
      throw Error('[[error:invalid-data]]');
    }
    if (!uid || !(yield (0, _privileges.canRespond)(pid, uid))) {
      throw Error('[[error:no-privileges]]');
    }

    let toAddKey;
    let toRemoveKeys;
    if (day) {
      toAddKey = `${_event.listKey}:pid:${pid}:responses:day:${day}:${value}`;
      toRemoveKeys = values.filter(function (val) {
        return val !== value;
      }).map(function (val) {
        return `${_event.listKey}:pid:${pid}:responses:day:${day}:${val}`;
      });
    } else {
      toAddKey = `${_event.listKey}:pid:${pid}:responses:${value}`;
      toRemoveKeys = values.filter(function (val) {
        return val !== value;
      }).map(function (val) {
        return `${_event.listKey}:pid:${pid}:responses:${val}`;
      });
    }

    yield _bluebird2.default.all([setsRemove(toRemoveKeys, uid), setAdd(toAddKey, uid), setAdd(`${_event.listKey}:pid:${pid}:responses:lists`, toAddKey)]);
  });

  return function submitResponse(_x) {
    return _ref.apply(this, arguments);
  };
})();

const removeAll = (() => {
  var _ref3 = (0, _bluebird.coroutine)(function* (pid) {
    const lists = yield getSetsMembers(`${_event.listKey}:pid:${pid}:responses:lists`);
    const old = values.map(function (val) {
      return `${_event.listKey}:pid:${pid}:responses:${val}`;
    });
    yield deleteAll([`${_event.listKey}:pid:${pid}:responses:lists`].concat((0, _toConsumableArray3.default)(lists), (0, _toConsumableArray3.default)(old)));
  });

  return function removeAll(_x2) {
    return _ref3.apply(this, arguments);
  };
})();

const getAll = (() => {
  var _ref4 = (0, _bluebird.coroutine)(function* () {
    var _ref5 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    let pid = _ref5.pid;
    var _ref5$uid = _ref5.uid;
    let uid = _ref5$uid === undefined ? 0 : _ref5$uid;
    var _ref5$selection = _ref5.selection;
    let selection = _ref5$selection === undefined ? values : _ref5$selection,
        day = _ref5.day;

    if (!(yield (0, _privileges.canViewPost)(pid, uid))) {
      throw Error('[[error:no-privileges]]');
    }

    let keys;
    if (day) {
      keys = selection.map(function (val) {
        return `${_event.listKey}:pid:${pid}:responses:day:${day}:${val}`;
      });
    } else {
      keys = selection.map(function (val) {
        return `${_event.listKey}:pid:${pid}:responses:${val}`;
      });
    }

    const responseUids = yield getSetsMembers(keys);
    const userFields = ['userslug', 'picture', 'username', 'icon:bgColor', 'icon:text'];

    var _ref6 = yield _bluebird2.default.all(responseUids.map(function (uids) {
      return getUsersFields(uids, userFields);
    })),
        _ref7 = (0, _slicedToArray3.default)(_ref6, 3);

    const yes = _ref7[0],
          maybe = _ref7[1],
          no = _ref7[2];


    return {
      yes: yes,
      maybe: maybe,
      no: no
    };
  });

  return function getAll() {
    return _ref4.apply(this, arguments);
  };
})();

const getUserResponse = (() => {
  var _ref8 = (0, _bluebird.coroutine)(function* (_ref9) {
    let pid = _ref9.pid,
        uid = _ref9.uid,
        day = _ref9.day;

    if (!uid || !(yield (0, _privileges.canRespond)(pid, uid))) {
      throw Error('[[error:no-privileges]]');
    }

    let keys;
    if (day) {
      keys = values.map(function (val) {
        return `${_event.listKey}:pid:${pid}:responses:day:${day}:${val}`;
      });
    } else {
      keys = values.map(function (val) {
        return `${_event.listKey}:pid:${pid}:responses:${val}`;
      });
    }

    const arr = yield _bluebird2.default.all(keys.map(function (key) {
      return isSetMember(key, uid);
    }));
    return values[arr.findIndex(function (val) {
      return !!val;
    })];
  });

  return function getUserResponse(_x4) {
    return _ref8.apply(this, arguments);
  };
})();

exports.submitResponse = submitResponse;
exports.removeAll = removeAll;
exports.getAll = getAll;
exports.getUserResponse = getUserResponse;
//# sourceMappingURL=responses.js.map