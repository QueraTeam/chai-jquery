const $ = require('jquery');

(function (chaiJquery) {
  chai.use(function (chai, utils) {
    console.log(utils);
    return chaiJquery(chai, utils, $);
  });
}(function (chai, utils, $) {
  var inspect = utils.inspect,
      flag = utils.flag;
  $ = $ || jQuery;

  var setPrototypeOf = '__proto__' in Object ?
    function (object, prototype) {
      object.__proto__ = prototype;
    } :
    function (object, prototype) {
      var excludeNames = /^(?:length|name|arguments|caller)$/;

      function copyProperties(dst, src) {
        Object.getOwnPropertyNames(src).forEach(function (name) {
          if (!excludeNames.test(name)) {
            Object.defineProperty(dst, name,
              Object.getOwnPropertyDescriptor(src, name));
          }
        });
      }

      copyProperties(object, prototype);
      copyProperties(object, Object.getPrototypeOf(prototype));
    };

  $.fn.inspect = function (depth) {
    var el = $('<div />').append(this.clone());
    if (depth !== undefined) {
      var children = el.children();
      while (depth-- > 0)
        children = children.children();
      children.html('...');
    }
    return el.html();
  };

  var props = {attr: 'attribute', css: 'CSS property', prop: 'property'};
  for (var prop in props) {
    (function (prop, description) {
      chai.Assertion.addMethod(prop, function (name, val, failMessage='', acceptMessage='') {
        var actual = flag(this, 'object')[prop](name);

        if (!flag(this, 'negate') || undefined === val) {
          this.assert(
              undefined !== actual
            , failMessage
            , acceptMessage
          );
        }

        if (undefined !== val) {
          this.assert(
              val === actual
            , failMessage
            , acceptMessage
          );
        }

        flag(this, 'object', actual);
      });
    })(prop, props[prop]);
  }


  chai.Assertion.addMethod('class', function (className, failMessage='', acceptMessage='') {
    this.assert(
        flag(this, 'object').hasClass(className)
      , failMessage
      , acceptMessage
      , className
    );
  });

  chai.Assertion.addMethod('id', function (id, failMessage='', acceptMessage='') {
    this.assert(
        flag(this, 'object').attr('id') === id
      , failMessage
      , acceptMessage
      , id
    );
  });

  chai.Assertion.addMethod('html', function (html, failMessage='', acceptMessage='') {
    var actual = flag(this, 'object').html();
    this.assert(
        actual === html
      , failMessage
      , acceptMessage
    );
  });

  chai.Assertion.addMethod('text', function (text, failMessage='', acceptMessage='') {
    var actual = flag(this, 'object').text();
    this.assert(
        actual === text
      , failMessage
      , acceptMessage
    );
  });

  chai.Assertion.addMethod('value', function (value, failMessage='', acceptMessage='') {
    var actual = flag(this, 'object').val();
    this.assert(
        flag(this, 'object').val() === value
      , failMessage
      , acceptMessage
    );
  });

  chai.Assertion.addMethod('descendants', function (selector, failMessage='', acceptMessage='') {
    this.assert(
        flag(this, 'object').has(selector).length > 0
      , failMessage
      , acceptMessage
    );
  });

  $.each(['visible', 'hidden', 'selected', 'checked', 'enabled', 'disabled'], function (i, attr) {
    chai.Assertion.addMethod(attr, function (failMessage='', acceptMessage='') {
      this.assert(
          flag(this, 'object').is(':' + attr)
        , failMessage
        , acceptMessage
      );
    });
  });

  chai.Assertion.addMethod('focus', function (failMessage='', acceptMessage='') {
    this.assert(
      // Can't use `$().is(':focus')` because of certain webkit browsers
      // see https://github.com/ariya/phantomjs/issues/10427
      flag(this, 'object').get(0) === document.activeElement
      , failMessage
      , acceptMessage
    );
  });
}));
