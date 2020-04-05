import { traverse, builders, Walker } from '@glimmer/syntax';
import ParseResult from './parse-result';

const PARSE_RESULT_FOR = new WeakMap();
const NODES_INFO = new WeakMap();

export function parse(template: string) {
  const result = new ParseResult(template, NODES_INFO);

  PARSE_RESULT_FOR.set(result.ast, result);

  return result.ast;
}

export function print(ast: any) {
  const parseResult = PARSE_RESULT_FOR.get(ast);
  return parseResult.print();
}

export function transform(template: string, plugin: any) {
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
