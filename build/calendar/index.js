'use strict';

require('fullcalendar');

var _convertToFC = require('./convertToFC');

var _convertToFC2 = _interopRequireDefault(_convertToFC);

var _displayEvent = require('./displayEvent');

var _displayEvent2 = _interopRequireDefault(_displayEvent);

var _locationHistory = require('../client/locationHistory');

var _locationHistory2 = _interopRequireDefault(_locationHistory);

var _responses = require('../client/responses');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const queryRegExp = /calendar\/?(?:\/*event\/+([0-9]+))?/;

const begin = momentLang => {
  const calendarOptions = {
    editable: false,
    header: {
      left: 'prev,next today',
      center: 'title',
      // right: 'month,agendaWeek,agendaDay',
      right: 'listMonth,month,agendaWeek'
    },
    defaultView: 'listMonth',
    themeSystem: 'bootstrap3',
    lang: momentLang,
    events: (start, end, timezone, callback) => {
      socket.emit('plugins.calendar.getEventsByDate', {
        startDate: start.valueOf(),
        endDate: end.valueOf()
      }, (err, events) => {
        if (err) {
          if (err.message) {
            app.alertError(err);
          }
          throw err;
        }

        callback((0, _convertToFC2.default)(events));
      });
    },
    eventClick: (_ref, e) => {
      let original = _ref.original,
          pid = _ref.id;

      e.preventDefault();
      e.stopPropagation();
      (0, _displayEvent2.default)(original);
      if (original.repeats) {
        ajaxify.updateHistory(`calendar/event/${pid}/${original.day}`);
      } else {
        ajaxify.updateHistory(`calendar/event/${pid}`);
      }
    },
    timezone: 'local'
  };

  let shouldHandle = false;

  _locationHistory2.default.listen((state, data) => {
    if (state.prev.startsWith('calendar') && state.current.startsWith('calendar')) {
      data.url = null; // eslint-disable-line no-param-reassign
      shouldHandle = true;
    } else {
      shouldHandle = false;
    }
  });

  const init = () => {
    const $calendar = $('#calendar');

    if ($calendar && !shouldHandle) {
      $calendar.fullCalendar(calendarOptions);
      // const btn = $('#plugin-calendar-cal-only-yes');
      // btn
      //   .on('click', (e) => {
      //     e.preventDefault();
      //     $calendar.toggleClass('plugin-calendar-cal-only-yes');
      //     btn.toggleClass('active');
      //   })
      //   .detach()
      //   .appendTo($calendar.find('.fc-toolbar .fc-right'));
    }

    const $display = $('#plugin-calendar-cal-event-display');
    if ($display) {
      $display.on('click', '.dismiss', () => {
        $display.modal('hide');
        ajaxify.updateHistory('calendar');
      });
    }

    const matches = location.pathname.match(queryRegExp);
    const pid = matches && parseInt(matches[1], 10);
    if (pid) {
      const el = $calendar.data('fullCalendar').getEventCache().find(x => x.id === pid);

      if (shouldHandle) {
        const event = el && el.original;
        if (event) {
          (0, _displayEvent2.default)(event);
        } else {
          history.replaceState({}, '', `${RELATIVE_PATH}/calendar`);
        }
      } else {
        (0, _responses.setupDTP)($display.find('[data-day]'), window.calendarEventData.day);
      }
      $calendar.fullCalendar('gotoDate', el ? el.start : window.calendarEventData.day || window.calendarEventData.startDate);
    } else if (shouldHandle) {
      $display.modal('hide');
    }
  };

  $(document).ready(init);
  $(window).on('action:ajaxify.end', init);
};

__webpack_public_path__ = `${RELATIVE_PATH}/plugins/nodebb-plugin-calendar/bundles/`; // eslint-disable-line

const lang = config.userLang || config.defaultLang;
const momentLang = lang.toLowerCase().replace(/_/g, '-');

try {
  if (momentLang === 'en-us') {
    begin('en-us');
  } else {
    require(`fullcalendar/dist/locale/${momentLang}`)(() => {
      // eslint-disable-line
      begin(momentLang);
    });
  }
} catch (e) {
  try {
    require(`fullcalendar/dist/locale/${momentLang.split('-')[0]}`)(() => {
      // eslint-disable-line
      begin(momentLang);
    });
  } catch (er) {
    begin('en-us');
    throw Error(`Could not load locale data (${momentLang}) for fullcalendar`);
  }
}
//# sourceMappingURL=index.js.map