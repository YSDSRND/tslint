import * as Lint from 'tslint'
import * as ts from 'typescript'

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

export class Rule extends Lint.Rules.TypedRule {
    public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): Array<Lint.RuleFailure> {
        return this.applyWithFunction(sourceFile, walk, this.getOptions(), program)
    }
}

const FAILURE_STRING = 'Binary operator "%s" can only be applied to operands of type "number"'

function isBinaryComparisonOperator(node: ts.Node): boolean {
    return node.kind === ts.SyntaxKind.LessThanToken
        || node.kind === ts.SyntaxKind.LessThanEqualsToken
        || node.kind === ts.SyntaxKind.GreaterThanToken
        || node.kind === ts.SyntaxKind.GreaterThanEqualsToken
}

function walk(ctx: Lint.WalkContext<{}>, program: ts.Program): void {
    const checker = program.getTypeChecker()

    return ts.forEachChild(ctx.sourceFile, function callback(node: ts.Node): void {
        if (isBinaryComparisonOperator(node)) {
            const expr = node.parent as ts.BinaryExpression

            for (const node of [expr.left, expr.right]) {
                const type = checker.getTypeAtLocation(node)
                const isAny = (type.flags & ts.TypeFlags.Any) > 0
                const isEnum = (type.flags & ts.TypeFlags.EnumLike) > 0
                const isNumber = (type.flags & ts.TypeFlags.NumberLike) > 0

                // enums are a special case in typescript. they
                // are treated as numbers which means you can assign
                // a number to an enum. we do not want enums to
                // be comparable to numbers so exclude them.
                if (!isAny && (isEnum || !isNumber)) {
                    ctx.addFailureAtNode(
                        expr, FAILURE_STRING.replace('%s', expr.operatorToken.getText())
                    )
                    break
                }
            }
            return
        }

        return ts.forEachChild(node, callback)
    })
}
