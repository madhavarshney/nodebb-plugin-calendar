'use strict';

require('source-map-support/register');

var _chalk = require('chalk');

require('./parse');

require('./formatDates');

require('./repetition');

console.log(_chalk.green.underline.bold('\t\tAll tests passed.\n'));
//# sourceMappingURL=index.js.map