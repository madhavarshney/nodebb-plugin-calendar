'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.postDelete = exports.composerFormatting = exports.privilegesListHuman = exports.privilegesGroupsList = exports.privilegesList = exports.postEdit = exports.postSave = exports.parseRaw = exports.parsePost = exports.adminMenu = exports.addNavigation = exports.init = undefined;

require('core-js/shim');

require('source-map-support/register');

var _init = require('./init');

var _init2 = _interopRequireDefault(_init);

var _parseFilters = require('./parseFilters');

var _postSave = require('./postSave');

var _privileges = require('./privileges');

var _event = require('./event');

require('./sockets');

var _translatorModule = require('./translatorModule');

var _translatorModule2 = _interopRequireDefault(_translatorModule);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Translator = require.main.require('./public/src/modules/translator').Translator; // Polyfills

(0, _translatorModule2.default)(Translator);

const addNavigation = (navs, callback) => {
  navs.push({
    route: '/calendar',
    title: '\\[\\[calendar:calendar\\]\\]',
    iconClass: 'fa-calendar',
    textClass: 'visible-xs-inline',
    text: '\\[\\[calendar:calendar\\]\\]'
  });
  callback(null, navs);
};
const adminMenu = (header, callback) => {
  header.plugins.push({
    route: '/plugins/calendar',
    icon: 'fa-calendar',
    name: 'Calendar'
  });
  callback(null, header);
};

const composerFormatting = (data, callback) => {
  data.options.push({
    name: 'plugin-calendar-event',
    className: 'fa fa-calendar-o plugin-calendar-composer-edit-event',
    title: '[[calendar:edit_event]]'
  });
  callback(null, data);
};

const postDelete = (pid, cb) => (0, _event.deleteEvent)(pid).asCallback(cb);

exports.init = _init2.default;
exports.addNavigation = addNavigation;
exports.adminMenu = adminMenu;
exports.parsePost = _parseFilters.parsePostCallback;
exports.parseRaw = _parseFilters.parseRawCallback;
exports.postSave = _postSave.postSaveCallback;
exports.postEdit = _postSave.postSaveCallback;
exports.privilegesList = _privileges.privilegesList;
exports.privilegesGroupsList = _privileges.privilegesGroupsList;
exports.privilegesListHuman = _privileges.privilegesListHuman;
exports.composerFormatting = composerFormatting;
exports.postDelete = postDelete;
//# sourceMappingURL=index.js.map