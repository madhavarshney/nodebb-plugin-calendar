'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatDates = undefined;

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _toArray2 = require('babel-runtime/helpers/toArray');

var _toArray3 = _interopRequireDefault(_toArray2);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const justDate = 'dddd, LL';
const justTime = 'LT';
const dateAndTime = 'LLLL';

const formatDates = (s, e, allday, lang, utc) => {
  const mom = utc ? _moment2.default.utc : _moment2.default;

  const start = mom(s).locale(lang);
  const end = mom(e).locale(lang);

  if (Math.abs(s - e) <= 60 * 1000) {
    if (allday) {
      return start.format(justDate);
    }
    return start.format(dateAndTime);
  }

  if (start.dayOfYear() === end.dayOfYear() && start.year() === end.year()) {
    if (allday) {
      return start.format(justDate);
    }
    return `${start.format(justDate)}<br>` + `${start.format(justTime)} - ${end.format(justTime)}`;
  }

  if (allday) {
    return `${start.format(justDate)} - ${end.format(justDate)}`;
  }
  return `${start.format(dateAndTime)} - ${end.format(dateAndTime)}`;
};

const init = Translator => {
  Translator.registerModule('moment', lang => {
    const momentLang = lang.replace(/[_@]/g, '-');
    const zero = (0, _moment2.default)(0).locale(momentLang);

    const timeago = (key, _ref) => {
      var _ref2 = (0, _slicedToArray3.default)(_ref, 1);

      let duration = _ref2[0];

      const ms = parseInt(duration, 10);
      switch (key) {
        case 'time-ago':
          return zero.from(ms);
        case 'time-in':
          return zero.to(ms);
        case 'time-duration':
          return zero.to(ms, true);
        default:
          return '';
      }
    };

    const timeDateView = (key, _ref3) => {
      var _ref4 = (0, _slicedToArray3.default)(_ref3, 4);

      let timezone = _ref4[0],
          start = _ref4[1],
          end = _ref4[2],
          allday = _ref4[3];

      const s = parseInt(start, 10);
      const e = parseInt(end, 10);
      const isAllday = allday === 'true';

      if (timezone === 'utc') {
        return formatDates(s, e, isAllday, momentLang, true);
      }
      if (timezone === 'local') {
        return formatDates(s, e, isAllday, momentLang, false);
      }
      return '';
    };

    const data = zero.localeData();
    const localeData = (key, _ref5) => {
      var _ref6 = (0, _toArray3.default)(_ref5);

      let n = _ref6[0],
          a = _ref6.slice(1);

      let name = n;
      if (!data[name]) {
        name = `_${n}`;
        if (!data[name]) {
          return '';
        }
      }
      const args = a.map(x => {
        if (x === 'true') {
          return true;
        }
        if (x === 'false') {
          return false;
        }
        if (/^[0-9]+$/.test(x)) {
          return parseInt(x, 10);
        }
        return x;
      });
      if (typeof data[name] === 'function') {
        return data[name].apply(data, (0, _toConsumableArray3.default)(args));
      }

      var _args = (0, _slicedToArray3.default)(args, 1);

      const index = _args[0];

      return data[name][index];
    };

    return (key, args) => {
      switch (key) {
        case 'time-in':
        case 'time-ago':
        case 'time-duration':
          return timeago(key, args);
        case 'time-date-view':
          return timeDateView(key, args);
        case 'locale-data':
          return localeData(key, args);
        default:
          return '';
      }
    };
  });
};

exports.formatDates = formatDates;
exports.default = init;
//# sourceMappingURL=translatorModule.js.map