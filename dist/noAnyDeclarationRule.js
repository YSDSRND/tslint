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
// this rule disallows every usage of "any" except those
// that are explicit up-casts. the rationale for this is
// that the programmer should be forced to write an accurate
// type definition but not be constrained by it in extreme
// cases.
//
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithFunction(sourceFile, walk, {});
    };
    Rule.FAILURE_STRING = "Do not use 'any' as a type declaration. Use a more specific type or '{}' if you do not care about type information.";
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
function isNodePartOfCastExpression(node) {
    while (ts.isTypeNode(node) || ts.isTypeElement(node)) {
        node = node.parent;
    }
    return node.kind === ts.SyntaxKind.AsExpression
        || node.kind === ts.SyntaxKind.TypeAssertionExpression;
}
function isNodeTypeParameterForRestArguments(node) {
    return node.parent.kind === ts.SyntaxKind.ArrayType
        && node.parent.parent.kind === ts.SyntaxKind.TypeParameter;
}
function walk(ctx) {
    return ts.forEachChild(ctx.sourceFile, function callback(node) {
        if (node.kind === ts.SyntaxKind.AnyKeyword) {
            if (isNodePartOfCastExpression(node) ||
                isNodeTypeParameterForRestArguments(node)) {
                return;
            }
            return ctx.addFailureAtNode(node, Rule.FAILURE_STRING, new Lint.Replacement(node.getStart(), node.getWidth(), '{}'));
        }
        return ts.forEachChild(node, callback);
    });
}
