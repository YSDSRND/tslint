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
var FAILURE_STRING = 'Excessive block nesting (maximum %d). Reduce nesting to improve code readability.';
var DEFAULT_MAX_DEPTH = 5;
function walk(ctx) {
    var depthStack = [0];
    var maxDepth = ctx.options.ruleArguments[0] || DEFAULT_MAX_DEPTH;
    return ts.forEachChild(ctx.sourceFile, function callback(node) {
        var isFunctionLike = ts.isFunctionLike(node);
        // functions reset the block nest counter.
        if (isFunctionLike) {
            depthStack.push(0);
        }
        // if we found a block and its immediate parent is not
        // a function, lets increment the block depth and make
        // sure we're not in too deep.
        if (node.kind === ts.SyntaxKind.Block && !ts.isFunctionLike(node.parent)) {
            var idx = depthStack.length - 1;
            depthStack[idx] += 1;
            if (depthStack[idx] > maxDepth) {
                ctx.addFailureAt(node.getStart(), 1, FAILURE_STRING.replace('%d', maxDepth));
            }
        }
        ts.forEachChild(node, callback);
        if (isFunctionLike) {
            depthStack.pop();
        }
    });
}
