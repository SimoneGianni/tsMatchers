(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../main/tsMatchers', '../main/numbers', '../main/typing', '../main/strictly', '../main/object', '../main/array', '../main/string'], factory);
    }
})(function (require, exports) {
    "use strict";
    var tsMatchers_1 = require('../main/tsMatchers');
    exports.assert = tsMatchers_1.assert;
    exports.is = tsMatchers_1.is;
    exports.dumpInConsole = tsMatchers_1.dumpInConsole;
    require('../main/numbers');
    require('../main/typing');
    require('../main/strictly');
    require('../main/object');
    require('../main/array');
    require('../main/string');
});

//# sourceMappingURL=index.js.map
