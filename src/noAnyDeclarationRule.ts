import * as Lint from "tslint"
import * as ts from "typescript"

//
// this rule disallows every usage of "any" except those
// that are explicit up-casts. the rationale for this is
// that the programmer should be forced to write an accurate
// type definition but not be constrained by it in extreme
// cases.
//

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING = "Do not use 'any' as a type declaration. Use a more specific type or '{}' if you do not care about type information."

    public apply(sourceFile: ts.SourceFile): Array<Lint.RuleFailure> {
        return this.applyWithFunction(sourceFile, walk, {})
    }
}

function isNodePartOfCastExpression(node: ts.Node): boolean {
    while (ts.isTypeNode(node) || ts.isTypeElement(node)) {
        node = node.parent
    }
    return node.kind === ts.SyntaxKind.AsExpression
        || node.kind === ts.SyntaxKind.TypeAssertionExpression
}

function isNodeTypeParameterForRestArguments(node: ts.Node): boolean {
    return node.parent.kind === ts.SyntaxKind.ArrayType
        && node.parent.parent.kind === ts.SyntaxKind.TypeParameter
}

function walk(ctx: Lint.WalkContext<{}>): void {
    return ts.forEachChild(ctx.sourceFile, function callback(node: ts.Node): void {
        if (node.kind === ts.SyntaxKind.AnyKeyword) {
            if (isNodePartOfCastExpression(node) ||
                isNodeTypeParameterForRestArguments(node)) {
                return
            }
            return ctx.addFailureAtNode(
                node,
                Rule.FAILURE_STRING,
                new Lint.Replacement(node.getStart(), node.getWidth(), '{}')
            )
        }
        return ts.forEachChild(node, callback)
    })
}
