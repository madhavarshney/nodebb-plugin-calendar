'use strict';

require('eonasdan-bootstrap-datetimepicker');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

require('./locationHistory');

var _templates = require('./templates');

var _templates2 = _interopRequireDefault(_templates);

var _setupComposerButton = require('./setupComposerButton');

var _setupComposerButton2 = _interopRequireDefault(_setupComposerButton);

var _createEvent = require('./createEvent');

var _createEvent2 = _interopRequireDefault(_createEvent);

var _parse = require('../lib/parse');

var _parse2 = _interopRequireDefault(_parse);

var _responses = require('./responses');

var _responses2 = _interopRequireDefault(_responses);

var _clientSideTranslation = require('./clientSideTranslation');

var _clientSideTranslation2 = _interopRequireDefault(_clientSideTranslation);

var _translatorModule = require('../lib/translatorModule');

var _translatorModule2 = _interopRequireDefault(_translatorModule);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const lang = config.userLang || config.defaultLang;
jQuery.fn.size = jQuery.fn.size || function size() {
  return this.length;
};

const begin = momentLang => {
  window.requirejs(['composer', 'composer/formatting', 'translator', 'benchpress'], (composer, formatting, translator, benchpress) => $(document).ready(() => {
    (0, _translatorModule2.default)(translator.Translator);
    (0, _clientSideTranslation2.default)(translator.Translator);

    benchpress.parse('partials/calendar/event-creation-modal', {}, template => translator.translate(template, lang, html => {
      $('body').append(html);

      (0, _setupComposerButton2.default)(composer, translator);
      $('.plugin-calendar-event-editor-date').datetimepicker({
        icons: {
          time: 'fa fa-clock-o',
          date: 'fa fa-calendar',
          up: 'fa fa-arrow-up',
          down: 'fa fa-arrow-down',
          previous: 'fa fa-arrow-left',
          next: 'fa fa-arrow-right',
          today: 'fa fa-crosshairs',
          clear: 'fa fa-trash',
          close: 'fa fa-times'
        },
        allowInputToggle: true,
        locale: momentLang,
        sideBySide: true,
        useCurrent: true
      });
      const createEvent = (0, _createEvent2.default)();

      const prepareFormattingTools = () => {
        if (!formatting) {
          return;
        }

        formatting.addButtonDispatch('plugin-calendar-event', textarea => {
          const $textarea = $(textarea);
          const oldVal = $textarea.val();
          const oldEvent = (0, _parse2.default)(oldVal.replace(/\[(\/?)event-invalid\]/g, '[$1event]'));
          createEvent(oldEvent || {}, event => {
            const text = event ? (0, _templates2.default)(event) : '';
            if (_parse.inPost.test(oldVal)) {
              const newVal = oldVal.replace(/\[event(?:-invalid)?\][\s\S]+\[\/event(?:-invalid)?\]/g, text);
              $textarea.val(newVal);
            } else {
              $textarea.val(`${oldVal}\n\n${text}`);
            }
            $textarea.trigger('input');
          });
        });
      };

      $(window).on('action:composer.enhanced', prepareFormattingTools);

      (0, _responses2.default)();
    }));
  }));
};

__webpack_public_path__ = `${RELATIVE_PATH}/plugins/nodebb-plugin-calendar/bundles/`; // eslint-disable-line

const momentLang = lang.toLowerCase().replace(/_/g, '-');

try {
  if (momentLang === 'en-us') {
    begin('en-us');
  } else {
    require(`moment/locale/${momentLang}`)(() => {
      // eslint-disable-line
      _moment2.default.locale(momentLang);
      begin(momentLang);
    });
  }
} catch (e) {
  try {
    require(`moment/locale/${momentLang.split('-')[0]}`)(() => {
      // eslint-disable-line
      _moment2.default.locale(momentLang);
      begin(momentLang);
    });
  } catch (er) {
    begin('en-us');
    throw Error(`could not load locale data (${momentLang}) for moment`);
  }
}
//# sourceMappingURL=index.js.map