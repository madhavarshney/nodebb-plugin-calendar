'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.inPost = exports.templates = exports.tagTemplate = exports.default = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const tagTemplate = (name, content) => `\\s*\\[${name}\\](${content})\\[\\/${name}\\]\\s*`;

const regExps = [{ key: 'name', pattern: '.*' }, { key: 'allday', pattern: 'true|false' }, { key: 'startDate', pattern: '[0-9]+' }, { key: 'endDate', pattern: '[0-9]+' }, { key: 'reminders', pattern: '\\[[0-9, ]*\\]' }, { key: 'location', pattern: '.*' }, { key: 'description', pattern: '[\\s\\S]*' }, { key: 'mandatory', pattern: 'true|false' }].map((_ref) => {
  let key = _ref.key,
      pattern = _ref.pattern;
  return {
    key: key,
    pattern: tagTemplate(key, pattern)
  };
});

regExps.push({
  key: 'repeats',
  pattern: '\\s*(?:\\[repeats\\](.*)\\[\\/repeats\\])?\\s*'
});

const inPost = new RegExp('(\\[event(?:\\-invalid)?\\][\\s\\S]+\\[\\/event(?:\\-invalid)?\\])');

const full = regExps.map(r => r.pattern).join('');
const eventRegExp = tagTemplate('event', full);

const parse = text => {
  const matches = text.match(eventRegExp);
  if (!matches || !matches.length) {
    return null;
  }
  const match = matches[1];
  const results = {};
  regExps.forEach((_ref2) => {
    let key = _ref2.key,
        pattern = _ref2.pattern;

    const m = match.match(pattern);
    results[key] = m && m[1] && m[1].trim();
  });

  results.repeats = match.match(/\[repeats\](.*)\[\/repeats\]/);
  results.repeats = results.repeats && results.repeats[1];

  try {
    return {
      name: results.name,
      allday: results.allday === 'true',
      startDate: parseInt(results.startDate, 10),
      endDate: parseInt(results.endDate, 10),
      reminders: JSON.parse(results.reminders).sort((a, b) => b - a),
      location: results.location,
      description: results.description,
      mandatory: results.mandatory === 'true',
      repeats: results.repeats ? JSON.parse(results.repeats.replace(/&quot;/g, '"')) : null
    };
  } catch (e) {
    return null;
  }
};

const templates = (0, _extends3.default)({}, regExps, {
  event: eventRegExp
});

exports.default = parse;
exports.tagTemplate = tagTemplate;
exports.templates = templates;
exports.inPost = inPost;
//# sourceMappingURL=parse.js.map