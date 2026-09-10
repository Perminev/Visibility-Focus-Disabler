(function () {
  'use strict';

  // 1. Подмена свойств document.hidden и document.visibilityState
  try {
    Object.defineProperties(document, {
      hidden: {
        get: () => false,
        enumerable: true,
        configurable: true
      },
      visibilityState: {
        get: () => 'visible',
        enumerable: true,
        configurable: true
      }
    });
  } catch (e) {
    console.error('Ошибка при переопределении свойств visibilityState:', e);
  }

  // 2. Блокировка вызова addEventListener для событий видимости и фокуса
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  const blockedEvents = [
    'visibilitychange',
    'blur',
    'focus',
    'mouseleave',
    'pagehide'
  ];

  EventTarget.prototype.addEventListener = function (type, listener, options) {
    if (blockedEvents.includes(type.toLowerCase())) {
      // Игнорируем регистрацию этих слушателей
      return;
    }
    return originalAddEventListener.call(this, type, listener, options);
  };

  // 3. Блокировка свойства onvisibilitychange, onblur, onfocus
  const nullifyProperty = (obj, prop) => {
    try {
      Object.defineProperty(obj, prop, {
        get: () => null,
        set: () => {}, // Запрещаем назначение
        configurable: true
      });
    } catch (e) {}
  };

  blockedEvents.forEach(evt => {
    nullifyProperty(window, 'on' + evt);
    nullifyProperty(document, 'on' + evt);
  });

  // 4. Перехват событий на стадии погружения (Capture Phase) и остановка их распространения
  const stopEvent = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  };

  blockedEvents.forEach(eventName => {
    window.addEventListener(eventName, stopEvent, true);
    document.addEventListener(eventName, stopEvent, true);
  });

  // 5. Подмена document.hasFocus()
  try {
    Document.prototype.hasFocus = () => true;
  } catch (e) {}

})();