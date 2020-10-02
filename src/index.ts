import { traverse, builders, Walker, print as glimmerPrint } from '@glimmer/syntax';
import type { AST, NodeVisitor } from '@glimmer/syntax';
import ParseResult, { NodeInfo } from './parse-result';

const PARSE_RESULT_FOR = new WeakMap<AST.Node, ParseResult>();
const NODE_INFO = new WeakMap<AST.Node, NodeInfo>();

export function parse(template: string): AST.Template {
  const result = new ParseResult(template, NODE_INFO);

  PARSE_RESULT_FOR.set(result.ast, result);

  return result.ast;
}

export function print(ast: AST.Node): string {
  const parseResult = PARSE_RESULT_FOR.get(ast);
  return parseResult.print();
}

export interface Syntax {
  parse: typeof parse;
  builders: typeof builders;
  print: typeof print;
  traverse: typeof traverse;
  Walker: typeof Walker;
}

export interface TransformPluginEnv {
  syntax: Syntax;
}

export interface TransformPluginBuilder {
  (env: TransformPluginEnv): NodeVisitor;
}

export interface ASTPlugin {
  name: string;
  visitor: NodeVisitor;
}

export interface TransformResult {
  ast: AST.Template;
  code: string;
}

export function transform(
  template: string | AST.Template,
  plugin: TransformPluginBuilder
): TransformResult {
  let ast;
  if (typeof template === 'string') {
    ast = parse(template);
  } else {
    // assume we were passed an ast
    ast = template;
  }
  const syntax = {
    parse,
    builders,
    print,
    traverse,
    Walker,
  };
  const env = { syntax };
  const visitor = plugin(env);
  traverse(ast, visitor);
  return { ast, code: print(ast) };
}

export { builders, traverse } from '@glimmer/syntax';
