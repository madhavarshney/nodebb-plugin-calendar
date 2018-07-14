'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.privilegeNames = exports.canRespond = exports.filterByPid = exports.privilegesListHuman = exports.privilegesGroupsList = exports.privilegesList = exports.filterUidsByPid = exports.canPostEvent = exports.canViewPost = undefined;

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _settings = require('./settings');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const p = _bluebird2.default.promisify;

const privileges = require.main.require('./src/privileges');
const posts = require.main.require('./src/posts');
const privilegesPostCan = p(privileges.posts.can);
const privilegesTopicCan = p(privileges.topics.can);
const filterUidsByCid = p(privileges.categories.filterUids);
const filterPids = p(privileges.posts.filter);

const privilegeNames = {
  canPost: 'plugin_calendar:event:post'
};

const canViewPost = (pid, uid) => privilegesPostCan('read', pid, uid);
const canPostEvent = (tid, uid) => privilegesTopicCan(privilegeNames.canPost, tid, uid);
const getCidByPid = p(posts.getCidByPid);

const canRespond = (pid, uid) => (0, _settings.getSetting)('respondIfCanReply').then(respondIfCanReply => {
  if (respondIfCanReply) {
    return privilegesPostCan('reply', pid, uid);
  }
  return canViewPost(pid, uid);
});

const filterUidsByPid = (uids, pid) => getCidByPid(pid).then(cid => filterUidsByCid('read', cid, uids));

const filterByPid = (events, uid) => filterPids('read', events.map(e => e.pid), uid).then(filtered => events.filter(e => filtered.includes(e.pid)));

const privilegesList = (list, callback) => callback(null, [].concat((0, _toConsumableArray3.default)(list), [privilegeNames.canPost]));
const privilegesGroupsList = (list, callback) => callback(null, [].concat((0, _toConsumableArray3.default)(list), [`groups:${privilegeNames.canPost}`]));
const privilegesListHuman = (list, callback) => callback(null, [].concat((0, _toConsumableArray3.default)(list), [{ name: 'Post events' }]));

exports.canViewPost = canViewPost;
exports.canPostEvent = canPostEvent;
exports.filterUidsByPid = filterUidsByPid;
exports.privilegesList = privilegesList;
exports.privilegesGroupsList = privilegesGroupsList;
exports.privilegesListHuman = privilegesListHuman;
exports.filterByPid = filterByPid;
exports.canRespond = canRespond;
exports.privilegeNames = privilegeNames;
//# sourceMappingURL=privileges.js.map