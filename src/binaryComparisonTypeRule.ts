import * as Lint from 'tslint'
import * as ts from 'typescript'

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

export class Rule extends Lint.Rules.AbstractRule {
    public apply(sourceFile: ts.SourceFile): Array<Lint.RuleFailure> {
        return this.applyWithFunction(sourceFile, walk, this.getOptions())
    }
}

type TypeNodeMap = {
    [name: string]: ts.TypeNode | undefined
}

function isBinaryComparisonOperator(node: ts.Node): boolean {
    return node.kind === ts.SyntaxKind.LessThanToken
        || node.kind === ts.SyntaxKind.LessThanEqualsToken
        || node.kind === ts.SyntaxKind.GreaterThanToken
        || node.kind === ts.SyntaxKind.GreaterThanEqualsToken
}

function isNumberLike(node: ts.Node): boolean {
    return node.kind === ts.SyntaxKind.NumberKeyword
        || node.kind === ts.SyntaxKind.NumericLiteral
}

function isLiteralLike(node: ts.Node): boolean {
    return ts.isLiteralExpression(node)
        || node.kind === ts.SyntaxKind.ObjectLiteralExpression
        || node.kind === ts.SyntaxKind.ArrayLiteralExpression
}

function isValidNumericComparison(typeStack: ReadonlyArray<TypeNodeMap>, node: ts.Node): boolean {
    // if the operand is a literal we can actually
    // make a definitive decision whether this comparison
    // is valid.
    if (isLiteralLike(node)) {
        return isNumberLike(node)
    }

    if (ts.isPropertyAccessExpression(node)) {
        node = node.name
    }

    // if the operand is an identifier, we try to determine
    // its type. if that fails we can't do much more.
    if (ts.isIdentifier(node)) {
        const type = resolveType(typeStack, node)

        if (typeof type !== 'undefined' && !isNumberLike(type)) {
            return false
        }
    }

    return true
}

function resolveType(typeStack: ReadonlyArray<TypeNodeMap>, node: ts.Identifier): ts.TypeNode | undefined {
    // loop backwards so we check closest block first.
    for (let i = typeStack.length - 1; i >= 0; --i) {
        const types = typeStack[i]
        if (types[node.text]) {
            return types[node.text]
        }
    }
    return undefined
}

function buildFailure(operator: ts.BinaryOperatorToken): string {
    return `Binary operator "${operator.getText()}" can only be applied to operands of type "number"`
}

function walk(ctx: Lint.WalkContext<{}>): void {
    const typeStack: Array<TypeNodeMap> = [{}]

    return ts.forEachChild(ctx.sourceFile, function callback(node: ts.Node): void {
        const isBlock = ts.isBlock(node)

        if (isBlock) {
            typeStack.push({})
        }

        // if we find an identifier we check if this
        // is its initial declaration. if that is the
        // case, we cache its type node.
        if (ts.isParameter(node) || ts.isVariableDeclaration(node) || ts.isPropertyDeclaration(node)) {
            const decl = node
            const name = decl.name

            if (decl.type && ts.isIdentifier(name)) {
                typeStack[typeStack.length - 1][name.text] = decl.type
            }
        }

        if (isBinaryComparisonOperator(node)) {
            const expr = node.parent as ts.BinaryExpression

            for (const node of [expr.left, expr.right]) {
                if (!isValidNumericComparison(typeStack, node)) {
                    ctx.addFailureAtNode(
                        expr, buildFailure(expr.operatorToken)
                    )
                    break
                }
            }

            return
        }

        ts.forEachChild(node, callback)

        if (isBlock) {
            typeStack.pop()
        }
    })
}
