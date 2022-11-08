var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import React, { Component, createContext } from 'react';
/**
 * @desc Fri Jul  6 10:24:20 2018 UTC updated
 */
export function createContextWithHOC(contextDefault, map, nameMapper) {
    var context = createContext(contextDefault);
    return {
        Provider: context.Provider,
        Consumer: context.Consumer,
        /**
         * @todo This should use HOCWithOverwriteProps
         */
        contextHOC: function (C) {
            var _a;
            var innerName = C.displayName || C.name || '';
            var displayName = nameMapper !== undefined ?
                nameMapper(innerName) :
                "HOC(" + innerName + ")";
            return _a = /** @class */ (function (_super) {
                    __extends(class_1, _super);
                    function class_1(props) {
                        var _this = _super.call(this, props) || this;
                        _this.renderChild = _this.renderChild.bind(_this);
                        return _this;
                    }
                    class_1.prototype.renderChild = function (c) {
                        var extraProps = map(c);
                        var mergedProps = __assign(__assign({}, this.props), extraProps);
                        return (React.createElement(C, __assign({}, mergedProps)));
                    };
                    class_1.prototype.render = function () {
                        return (React.createElement(context.Consumer, null, this.renderChild));
                    };
                    return class_1;
                }(Component)),
                _a.displayName = displayName,
                _a;
        },
    };
}
//# sourceMappingURL=createContextWithHOC.js.map