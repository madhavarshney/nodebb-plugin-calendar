'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _reminders = require('./reminders');

var _reminders2 = _interopRequireDefault(_reminders);

var _repetition = require('./repetition');

var _repetition2 = _interopRequireDefault(_repetition);

var _validateEvent5 = require('../lib/validateEvent');

var _validateEvent6 = _interopRequireDefault(_validateEvent5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const defaultEvent = {
  name: '',
  allday: false,
  startDate: Date.now(),
  endDate: Date.now() + 1000 * 60 * 60,
  reminders: [],
  location: '',
  description: '',
  mandatory: false,
  repeats: null
};

const formats = {
  timeDate: 'L LT',
  date: 'L'
};

const createEventFactory = () => {
  const modal = $('#plugin-calendar-event-editor').modal({
    backdrop: false,
    show: false
  });
  const inputs = {
    name: modal.find('#plugin-calendar-event-editor-name'),
    allday: modal.find('#plugin-calendar-event-editor-allday'),
    startDate: modal.find('#plugin-calendar-event-editor-startDate'),
    endDate: modal.find('#plugin-calendar-event-editor-endDate'),
    reminders: modal.find('#plugin-calendar-event-editor-reminders'),
    location: modal.find('#plugin-calendar-event-editor-location'),
    description: modal.find('#plugin-calendar-event-editor-description'),
    mandatory: modal.find('#plugin-calendar-event-editor-mandatory'),
    repetition: modal.find('#plugin-calendar-event-editor-repetition'),
    repeatEndDate: modal.find('#plugin-calendar-event-editor-repetition-endDate')
  };
  const reminders = (0, _reminders2.default)(inputs.reminders);
  const repetition = (0, _repetition2.default)(inputs.repetition);

  inputs.allday.on('change', () => {
    const format = inputs.allday.prop('checked') ? formats.date : formats.timeDate;
    inputs.startDate.data('DateTimePicker').format(format);
    inputs.endDate.data('DateTimePicker').format(format);
  });

  const setInputs = event => {
    inputs.name.val(event.name);
    inputs.allday.prop('checked', event.allday);
    inputs.startDate.data('DateTimePicker').date((0, _moment2.default)(event.startDate));
    inputs.endDate.data('DateTimePicker').date((0, _moment2.default)(event.endDate));
    reminders.setReminders(event.reminders);
    repetition.setRepeat(event.repeats);
    inputs.location.val(event.location);
    inputs.description.val(event.description);
    inputs.mandatory.prop('checked', event.mandatory);

    const format = event.allday ? formats.date : formats.timeDate;
    inputs.startDate.data('DateTimePicker').format(format);
    inputs.endDate.data('DateTimePicker').format(format);
  };
  const getInputs = () => {
    const event = {
      name: inputs.name.val().trim(),
      allday: inputs.allday.prop('checked'),
      startDate: inputs.startDate.data('DateTimePicker').date().valueOf(),
      endDate: inputs.endDate.data('DateTimePicker').date().valueOf(),
      reminders: reminders.getReminders(),
      repeats: repetition.getRepeat(),
      location: inputs.location.val().trim(),
      description: inputs.description.val().trim(),
      mandatory: inputs.mandatory.prop('checked')
    };

    if (event.allday) {
      const s = new Date(event.startDate);
      const e = new Date(event.endDate);

      s.setHours(0, 0, 0, 0);
      e.setHours(23, 59, 59, 999);

      event.startDate = s.valueOf();
      event.endDate = e.valueOf();
    }

    return event;
  };

  const alertFailure = input => {
    input.closest('.form-group').addClass('has-error');
  };

  const createEvent = (data, callback) => {
    const event = Object.assign({}, defaultEvent, data);
    setInputs(event);
    modal.find('.form-group').removeClass('has-error');
    modal.modal('show');

    const submit = modal.find('#plugin-calendar-event-editor-submit');
    const del = modal.find('#plugin-calendar-event-editor-delete');

    const onClick = () => {
      const newEvent = getInputs();
      modal.find('.form-group').removeClass('has-error');

      var _validateEvent = (0, _validateEvent6.default)(newEvent),
          _validateEvent2 = (0, _slicedToArray3.default)(_validateEvent, 2);

      const failed = _validateEvent2[0],
            failures = _validateEvent2[1];

      if (failed) {
        failures.map(failure => inputs[failure]).forEach(alertFailure);
        return;
      }

      modal.modal('hide');
      submit.off('click', onClick);
      callback(newEvent);
    };

    submit.on('click', onClick);

    del.one('click', () => {
      modal.modal('hide');
      submit.off('click', onClick);
      callback(null);
    });

    const onChange = () => {
      const newEvent = getInputs();
      modal.find('.form-group').removeClass('has-error');

      var _validateEvent3 = (0, _validateEvent6.default)(newEvent),
          _validateEvent4 = (0, _slicedToArray3.default)(_validateEvent3, 2);

      const failed = _validateEvent4[0],
            failures = _validateEvent4[1];

      if (failed) {
        failures.map(failure => inputs[failure]).forEach(alertFailure);
      }
    };
    modal.on('change dp.change', onChange);
  };

  return createEvent;
};

exports.default = createEventFactory;
//# sourceMappingURL=createEvent.js.map