"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var Lint = require("tslint");
var ts = require("typescript");
//
// a rule to make sure binary operators >, >=, <, <=
// are used only with literal numbers (if applicable).
//
// this would fail:
//
// function (yee: {}): boolean {
//   return yee > 5
// }
//
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.applyWithProgram = function (sourceFile, program) {
        return this.applyWithFunction(sourceFile, walk, this.getOptions(), program);
    };
    return Rule;
}(Lint.Rules.TypedRule));
exports.Rule = Rule;
var FAILURE_STRING = 'Binary operator "%s" can only be applied to operands of type "number"';
function isBinaryComparisonOperator(node) {
    return node.kind === ts.SyntaxKind.LessThanToken
        || node.kind === ts.SyntaxKind.LessThanEqualsToken
        || node.kind === ts.SyntaxKind.GreaterThanToken
        || node.kind === ts.SyntaxKind.GreaterThanEqualsToken;
}
function walk(ctx, program) {
    var checker = program.getTypeChecker();
    return ts.forEachChild(ctx.sourceFile, function callback(node) {
        if (isBinaryComparisonOperator(node)) {
            var expr = node.parent;
            for (var _i = 0, _a = [expr.left, expr.right]; _i < _a.length; _i++) {
                var node_1 = _a[_i];
                var type = checker.getTypeAtLocation(node_1);
                var isAny = (type.flags & ts.TypeFlags.Any) > 0;
                var isEnum = (type.flags & ts.TypeFlags.EnumLike) > 0;
                var isNumber = (type.flags & ts.TypeFlags.NumberLike) > 0;
                // enums are a special case in typescript. they
                // are treated as numbers which means you can assign
                // a number to an enum. we do not want enums to
                // be comparable to numbers so exclude them.
                if (!isAny && (isEnum || !isNumber)) {
                    ctx.addFailureAtNode(expr, FAILURE_STRING.replace('%s', expr.operatorToken.getText()));
                    break;
                }
            }
            return;
        }
        return ts.forEachChild(node, callback);
    });
}
