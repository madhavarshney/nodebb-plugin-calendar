'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
const state = {
  current: window.location.pathname,
  prev: '',
  handlers: [],
  listen: function listen(handler) {
    this.handlers.push(handler);
  }
};

$(window).on('action:ajaxify.start', (e, data) => {
  state.prev = state.current;
  state.current = data.url;

  state.handlers.forEach(handler => handler(state, data));
});

exports.default = state;
//# sourceMappingURL=locationHistory.js.map