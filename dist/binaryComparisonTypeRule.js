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
// because tslint does not have complete type information
// this only works on literals and identifiers with a
// type declaration. eg. it cannot determine the inferred
// type.
//
// this would fail:
//
// function (yee: string): boolean {
//   return yee > 5
// }
//
// this would also fail:
//
//   'yee' > 5
//
// this however, is OK because "a" has an inferred string type
// that we cannot detect before compiling.
//
//   const a = 'yee'
//   a > 5
//
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithFunction(sourceFile, walk, this.getOptions());
    };
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
function isBinaryComparisonOperator(node) {
    return node.kind === ts.SyntaxKind.LessThanToken
        || node.kind === ts.SyntaxKind.LessThanEqualsToken
        || node.kind === ts.SyntaxKind.GreaterThanToken
        || node.kind === ts.SyntaxKind.GreaterThanEqualsToken;
}
function isNumberLike(node) {
    return node.kind === ts.SyntaxKind.NumberKeyword
        || node.kind === ts.SyntaxKind.NumericLiteral;
}
function isLiteralLike(node) {
    return ts.isLiteralExpression(node)
        || node.kind === ts.SyntaxKind.ObjectLiteralExpression
        || node.kind === ts.SyntaxKind.ArrayLiteralExpression;
}
function isValidNumericComparison(identifierTypes, node) {
    // if the operand is a literal we can actually
    // make a definitive decision whether this comparison
    // is valid.
    if (isLiteralLike(node)) {
        return isNumberLike(node);
    }
    // if the operand is an identifier, we try to determine
    // its type. if that fails we can't do much more.
    if (ts.isIdentifier(node)) {
        var type = identifierTypes[node.text];
        if (typeof type !== 'undefined' && !isNumberLike(type)) {
            return false;
        }
    }
    return true;
}
function buildFailure(operator) {
    return "Binary operator \"" + operator.getText() + "\" can only be applied to operands of type \"number\"";
}
function walk(ctx) {
    var identifierTypes = {};
    return ts.forEachChild(ctx.sourceFile, function callback(node) {
        // if we find an identifier we check if this
        // is its initial declaration. if that is the
        // case, we cache its type node.
        if (ts.isParameter(node) || ts.isVariableDeclaration(node)) {
            var decl = node;
            var name_1 = decl.name;
            if (decl.type && ts.isIdentifier(name_1)) {
                identifierTypes[name_1.text] = decl.type;
            }
        }
        if (isBinaryComparisonOperator(node)) {
            var expr = node.parent;
            for (var _i = 0, _a = [expr.left, expr.right]; _i < _a.length; _i++) {
                var node_1 = _a[_i];
                if (!isValidNumericComparison(identifierTypes, node_1)) {
                    ctx.addFailureAtNode(expr, buildFailure(expr.operatorToken));
                    break;
                }
            }
            return;
        }
        return ts.forEachChild(node, callback);
    });
}
