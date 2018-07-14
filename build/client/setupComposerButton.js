'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _parse = require('../lib/parse');

exports.default = (composer, translator) => {
  const onChange = () => {
    const data = composer.posts[composer.active];
    socket.emit('plugins.calendar.canPostEvent', data, (e, canPost) => {
      $(`#cmp-uuid-${composer.active}`).find('.plugin-calendar-composer-edit-event').parent().toggle(canPost);
    });
  };

  const alterSubmit = () => {
    const uuid = composer.active;
    const comp = $(`#cmp-uuid-${uuid}`);
    const write = comp.find('.write-container textarea.write');
    const eventExisted = _parse.inPost.test(write.val());

    if (eventExisted) {
      const button = comp.find('.composer-submit:visible');

      const orig = $._data(button[0], 'events').click.map(x => x.handler); // eslint-disable-line
      const trigger = (self, e) => {
        orig.forEach(handler => {
          handler.call(self, e);
        });
      };
      button.off('click').on('click', function onClick(e) {
        const text = write.val();
        if (!_parse.inPost.test(text)) {
          translator.translate('[[calendar:confirm_delete_event]]', question => {
            bootbox.confirm(question, okay => {
              if (okay) {
                trigger(this, e);
              }
            });
          });
        } else {
          trigger(this, e);
        }
      });
    }
  };

  $(window).on('action:composer.post.new' + ' action:composer.post.edit' + ' action:composer.topic.new', () => {
    setTimeout(() => {
      onChange();
      alterSubmit();
    }, 400);
  });
  $(document.body).on('change', '.composer .category-list', onChange);
};
//# sourceMappingURL=setupComposerButton.js.map