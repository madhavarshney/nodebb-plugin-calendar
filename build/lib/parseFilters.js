'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseRaw = exports.parseRawCallback = exports.parsePost = exports.parsePostCallback = undefined;

var _bluebird = require('bluebird');

var _validator = require('validator');

var _validator2 = _interopRequireDefault(_validator);

var _templates = require('./templates');

var _parse = require('./parse');

var _parse2 = _interopRequireDefault(_parse);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const eventRX = new RegExp((0, _parse.tagTemplate)('event', '[\\s\\S]*'));
const invalidRX = new RegExp(`(${(0, _parse.tagTemplate)('event-invalid', '[\\s\\S]*')})`);

const parseRaw = (() => {
  var _ref = (0, _bluebird.coroutine)(function* (content) {
    const input = content.replace(/\[description\]([\s\S]*)\[\/description\]/, '[description]<p>$1</p>[/description]');
    const event = (0, _parse2.default)(input);
    if (!event) {
      return input.replace(invalidRX, '<div class="hide">$1</div>');
    }
    event.name = _validator2.default.escape(event.name);

    const eventText = (0, _templates.eventTemplate)({ event: event });
    const text = input.replace(eventRX, eventText);
    return text;
  });

  return function parseRaw(_x) {
    return _ref.apply(this, arguments);
  };
})();

const parsePost = (() => {
  var _ref2 = (0, _bluebird.coroutine)(function* (data) {
    const postData = data.postData;
    postData.content = yield parseRaw(postData.content);

    return data;
  });

  return function parsePost(_x2) {
    return _ref2.apply(this, arguments);
  };
})();

const parsePostCallback = (postData, cb) => parsePost(postData).asCallback(cb);
const parseRawCallback = (content, cb) => parseRaw(content).asCallback(cb);

exports.parsePostCallback = parsePostCallback;
exports.parsePost = parsePost;
exports.parseRawCallback = parseRawCallback;
exports.parseRaw = parseRaw;
//# sourceMappingURL=parseFilters.js.map