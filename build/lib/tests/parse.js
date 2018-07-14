'use strict';

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _parse = require('../parse');

var _parse2 = _interopRequireDefault(_parse);

var _templates = require('../../client/templates');

var _templates2 = _interopRequireDefault(_templates);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

[() => {
  // basic test
  const data = {
    name: 'a test name',
    allday: true,
    startDate: Date.now(),
    endDate: Date.now() + 3 * 24 * 60 * 60 * 1000,
    reminders: [50, 20, 10, 0],
    location: 'here somewhere',
    description: 'somewhere else',
    mandatory: false,
    repeats: null
  };
  const result = (0, _parse2.default)(`other things that make sense
      ${(0, _templates2.default)(data)}
      and some more *markdown*`);

  (0, _assert2.default)(result && typeof result === 'object', 'Expected Object, got a falsy value');
  _assert2.default.strictEqual(data.name, result.name, '`name` field incorrect');
  _assert2.default.strictEqual(data.allday, result.allday, '`allday` field incorrect');
  _assert2.default.strictEqual(data.startDate, result.startDate, '`startDate` field incorrect');
  _assert2.default.strictEqual(data.endDate, result.endDate, '`endDate` field incorrect');
  _assert2.default.deepEqual(data.reminders, result.reminders, '`reminders` field incorrect');
  _assert2.default.strictEqual(data.location, result.location, '`location` field incorrect');
  _assert2.default.strictEqual(data.description, result.description, '`description` field incorrect');
  _assert2.default.strictEqual(data.repeats, result.repeats, '`repeats` field incorrect');
}, () => {
  // test allday false and repeats as full object
  const data = {
    name: 'a test name',
    allday: false,
    startDate: Date.now() - 3 * 24 * 60 * 60 * 1000,
    endDate: Date.now(),
    reminders: [50, 20, 10, 0],
    location: 'here somewhere',
    description: 'somewhere else',
    mandatory: false,
    repeats: {
      every: {
        week: true
      },
      endDate: null
    }
  };
  const result = (0, _parse2.default)((0, _templates2.default)(data));
  (0, _assert2.default)(typeof result === 'object', 'Expected Object, got something else');
  _assert2.default.strictEqual(data.name, result.name, '`name` field incorrect');
  _assert2.default.strictEqual(data.allday, result.allday, '`allday` field incorrect');
  _assert2.default.strictEqual(data.startDate, result.startDate, '`startDate` field incorrect');
  _assert2.default.strictEqual(data.endDate, result.endDate, '`endDate` field incorrect');
  _assert2.default.deepEqual(data.reminders, result.reminders, '`reminders` field incorrect');
  _assert2.default.strictEqual(data.location, result.location, '`location` field incorrect');
  _assert2.default.strictEqual(data.description, result.description, '`description` field incorrect');
  _assert2.default.deepEqual(data.repeats, result.repeats, '`repeats` field incorrect');
}, () => {
  // test bad date failing completely
  const data = {
    name: 'a test name',
    allday: false,
    startDate: Date.now() - 3 * 24 * 60 * 60 * 1000,
    endDate: 'a string',
    reminders: [50, 20, 10, 0],
    location: 'here somewhere',
    description: 'somewhere else',
    mandatory: false
  };
  const result = (0, _parse2.default)((0, _templates2.default)(data));
  _assert2.default.strictEqual(null, result, 'Expected null, got something else');
}, () => {
  // test bad reminders failing completely
  const data = {
    name: 'a test name',
    allday: false,
    startDate: Date.now() - 3 * 24 * 60 * 60 * 1000,
    endDate: Date.now(),
    reminders: 'a string',
    location: 'here somewhere',
    description: 'somewhere else',
    mandatory: false
  };
  const result = (0, _parse2.default)((0, _templates2.default)(data));
  _assert2.default.strictEqual(null, result, 'Expected null, got something else');
}, () => {
  // test bad location failing completely
  const data = {
    name: 'a test name',
    allday: false,
    startDate: Date.now() - 3 * 24 * 60 * 60 * 1000,
    endDate: Date.now(),
    reminders: [50, 20, 10, 0],
    location: 'here somewhere\nhasbbks',
    description: 'somewhere else',
    mandatory: false
  };
  const result = (0, _parse2.default)((0, _templates2.default)(data));
  _assert2.default.strictEqual(null, result, 'Expected null, got something else');
}, () => {
  // test bad name failing completely
  const data = {
    name: 'a test name\ndsjvhoaho',
    allday: false,
    startDate: Date.now() - 3 * 24 * 60 * 60 * 1000,
    endDate: Date.now(),
    reminders: [50, 20, 10, 0],
    location: 'here somewhere',
    description: 'somewhere else',
    mandatory: false
  };
  const result = (0, _parse2.default)((0, _templates2.default)(data));
  _assert2.default.strictEqual(null, result, 'Expected null, got something else');
}].forEach(x => x());
//# sourceMappingURL=parse.js.map