'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const rawTemplate = event => {
  const repeats = event.repeats && (0, _extends3.default)({}, event.repeats, {
    endDate: event.repeats.endDate ? event.repeats.endDate.valueOf() : null
  });
  return `[event][name]${event.name}[/name][allday]${event.allday}[/allday]` + `[startDate]${event.startDate}[/startDate][endDate]${event.endDate}[/endDate]` + `[reminders]${JSON.stringify(event.reminders)}[/reminders]` + `[location]${event.location}[/location]` + `[description]${event.description}[/description][mandatory]${event.mandatory}[/mandatory]` + `${repeats ? `[repeats]${JSON.stringify(repeats)}[/repeats]` : ''}[/event]`;
};

exports.default = rawTemplate;
//# sourceMappingURL=templates.js.map