'use strict';

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _repetition = require('../repetition');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(() => {
  const event = {
    startDate: 1478576134000,
    endDate: 1478576134000 + 2 * 60 * 60 * 1000,
    repeats: {
      every: {
        day: true
      },
      endDate: 1478576134000 + 3 * 24 * 60 * 60 * 1000
    }
  };

  const occurences = (0, _repetition.getOccurencesOfRepetition)(event, 1478576134000 + 5000, 1478576134000 + 36 * 60 * 60 * 1000);
  _assert2.default.deepEqual(occurences, [{
    startDate: 1478576134000 + 1 * 24 * 60 * 60 * 1000,
    endDate: 1478576134000 + 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000,
    repeats: {
      every: {
        day: true,
        numOfDays: [1]
      },
      endDate: 1478576134000 + 3 * 24 * 60 * 60 * 1000
    }
  }]);
})();
//# sourceMappingURL=repetition.js.map