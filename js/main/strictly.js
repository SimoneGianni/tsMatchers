(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './tsMatchers'], factory);
    }
})(function (require, exports) {
    "use strict";
    var tsMatchers_1 = require('./tsMatchers');
    var strictlyContainer = new tsMatchers_1.ContainerObj();
    tsMatchers_1.isContainer.registerSub('strictly', strictlyContainer);
    //var notStrictly = makeWrapper(strictly, (m)=>not(m));
    // TODO these should not be here if wrappers could wrap wrappers
    //registerWrapper(is.not, 'strictly', notStrictly);
    //var strictly = <OuterStrictly><any>strictlyContainer;
    strictlyContainer.registerMatcher('equal', tsMatchers_1.exactly);
});

//# sourceMappingURL=strictly.js.map
