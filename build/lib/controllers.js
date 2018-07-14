'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _event = require('./event');

var _privileges = require('./privileges');

var _templates = require('./templates');

var _responses = require('./responses');

var _settings = require('./settings');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const privileges = require.main.require('./src/privileges');
const categories = require.main.require('./src/categories');

const p = _bluebird2.default.promisify;

const getAllCategoryFields = p(categories.getAllCategoryFields);
const filterCids = p(privileges.categories.filterCids);

/* eslint-disable */
function shadeColor2(color, percent) {
  var f = parseInt(color.slice(1), 16),
      t = percent < 0 ? 0 : 255,
      p = percent < 0 ? percent * -1 : percent,
      R = f >> 16,
      G = f >> 8 & 0x00FF,
      B = f & 0x0000FF;
  return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
}
/* eslint-enable */

exports.default = (router, middleware) => {
  const renderAdmin = (req, res, next) => {
    (0, _settings.getSettings)().then(settings => {
      res.render('admin/plugins/calendar', {
        settings: settings
      });
    }).catch(next);
  };
  router.get('/admin/plugins/calendar', middleware.admin.buildHeader, renderAdmin);
  router.get('/api/admin/plugins/calendar', renderAdmin);

  router.get('/api/admin/plugins/calendar/save', (req, res, next) => {
    _bluebird2.default.resolve().then(() => (0, _settings.setSettings)(JSON.parse(req.query.settings))).then(() => {
      res.sendStatus(200);
    }).catch(next);
  });

  const renderPage = (req, res, next) => {
    const cb = (err, data) => {
      if (err) {
        next(err);
        return;
      }
      res.render('calendar', data);
    };

    // not using server rendering for events because it could be a lot of info
    // better to have a fast page load time

    (0, _bluebird.coroutine)(function* () {
      const uid = req.uid;
      const cats = yield getAllCategoryFields(['cid', 'bgColor']);
      const filtered = yield filterCids('read', cats.map(function (c) {
        return c.cid;
      }), uid);

      const colors = cats.filter(function (c) {
        return filtered.includes(c.cid);
      });

      const style = colors.map(function (_ref2) {
        let cid = _ref2.cid,
            bgColor = _ref2.bgColor;
        return `
        .plugin-calendar-cal-event-category-${cid} {
        background-color: ${bgColor}CC !important;
        border-color: ${shadeColor2(bgColor, -0.2)} !important;
      }`;
      });

      var _req$params = req.params;
      const pid = _req$params.eventPid,
            day = _req$params.eventDay;


      if (!pid || !(yield (0, _privileges.canViewPost)(pid, uid))) {
        return {
          calendarEventsStyle: style.join('\n'),
          title: '[[calendar:calendar]]',
          eventJSON: 'null'
        };
      }

      const raw = yield (0, _event.getEvent)(pid);
      const event = yield (0, _event.escapeEvent)(raw);
      event.day = day || null;

      if (event.repeats && event.day) {
        const startDate = event.startDate,
              endDate = event.endDate;

        const occurenceDate = new Date(day);
        const s = new Date(startDate);

        s.setUTCFullYear(occurenceDate.getUTCFullYear());
        s.setUTCDate(occurenceDate.getUTCDate());
        s.setUTCMonth(occurenceDate.getUTCMonth());

        event.startDate = s.valueOf();
        event.endDate = event.startDate + (endDate - startDate);
      }

      event.responses = {
        [uid]: yield (0, _responses.getUserResponse)({ pid: pid, day: day, uid: uid })
      };

      return {
        calendarEventsStyle: style.join('\n'),
        title: '[[calendar:calendar]]',
        eventData: event,
        eventJSON: JSON.stringify(event),
        eventHTML: (0, _templates.eventTemplate)({ event: event, uid: uid })
      };
    })().asCallback(cb);
  };

  router.get('/calendar/event/:eventPid/:eventDay', middleware.buildHeader, renderPage);
  router.get('/api/calendar/event/:eventPid/:eventDay', renderPage);
  router.get('/calendar/event/:eventPid', middleware.buildHeader, renderPage);
  router.get('/api/calendar/event/:eventPid', renderPage);
  router.get('/calendar', middleware.buildHeader, renderPage);
  router.get('/api/calendar', renderPage);
};
//# sourceMappingURL=controllers.js.map