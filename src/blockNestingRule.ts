import * as Lint from 'tslint'
import * as ts from 'typescript'

export class Rule extends Lint.Rules.AbstractRule {
    public apply(sourceFile: ts.SourceFile): Array<Lint.RuleFailure> {
        return this.applyWithFunction(sourceFile, walk, this.getOptions())
    }
}

const FAILURE_STRING = 'Excessive block nesting (maximum %d). Reduce nesting to improve code readability.'
const DEFAULT_MAX_DEPTH = 5

function walk(ctx: Lint.WalkContext<Lint.IOptions>): void {
    const depthStack: Array<number> = [0]
    const maxDepth = ctx.options.ruleArguments[0] || DEFAULT_MAX_DEPTH

    return ts.forEachChild(ctx.sourceFile, function callback(node: ts.Node): void {
        const isFunctionLike = ts.isFunctionLike(node)
        const shouldTouchCounter = node.kind === ts.SyntaxKind.Block && !ts.isFunctionLike(node.parent)

        // functions reset the block nest counter.
        if (isFunctionLike) {
            depthStack.push(0)
        }

        const idx = depthStack.length - 1

        // if we found a block and its immediate parent is not
        // a function, lets increment the block depth and make
        // sure we're not in too deep.
        if (shouldTouchCounter) {
            depthStack[idx] += 1

            if (depthStack[idx] > maxDepth) {
                ctx.addFailureAt(
                    node.getStart(), 1, FAILURE_STRING.replace('%d', maxDepth)
                )
            }
        }

        ts.forEachChild(node, callback)

        if (shouldTouchCounter) {
            depthStack[idx] -= 1
        }

        if (isFunctionLike) {
            depthStack.pop()
        }
    })
}
