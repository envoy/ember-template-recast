# ember-template-recast

## APIs

### parse

Used to parse a given template string into an AST. Generally speaking, this AST
can be mutated and passed into `print` (docs below).

```js
const templateRecast = require('ember-template-recast');
const template = `
{{foo-bar
  baz="stuff"
}}
`;
let ast = templateRecast.parse(template);
// now you can work with `ast`
```

### print

Used to generate a new template string representing the provided AST.

```js
const templateRecast = require('ember-template-recast');
const template = `
{{foo-bar
  baz="stuff"
}}
`;
let ast = templateRecast.parse(template);
ast.body[0].hash[0].key = 'derp';

templateRecast.print(ast);

    {{foo-bar
      derp="stuff"
    }}
```

### transform

Used to easily traverse (and possibly mutate) a given template. Returns the
resulting AST and the printed template.

The plugin argument has roughly the following interface:

```ts
export interface ASTPluginBuilder {
  (env: ASTPluginEnvironment): NodeVisitor;
}

export interface ASTPluginEnvironment {
  meta?: any;
  syntax: Syntax;
}

export interface Syntax {
  parse: typeof preprocess;
  builders: typeof builders;
  print: typeof print;
  traverse: typeof traverse;
  Walker: typeof Walker;
}
```

The list of known builders on the `env.syntax.builders` are [found
here](https://github.com/glimmerjs/glimmer-vm/blob/master/packages/@glimmer/syntax/lib/builders.ts#L308-L337)

Example:
```js
const { transform } = require('ember-template-recast');
const template = `
{{foo-bar
  baz="stuff"
}}
`;
let { code } = transform(template, env => {
  let { builders: b } = env.syntax;

  return {
    MustacheStatement() {
      return b.mustache(b.path('wat-wat'));
    },
  };
});

console.log(code); // => {{wat-wat}}
```

## Command Line Usage

ember-template-recast comes with a binary for running a transform across multiple
files, similar to jscodeshift.

```
npm install -g ember-template-recast
ember-template-recast directory/of/templates -t transform.js
```

Example transform plugin:

```js
module.exports = function({ source, path }, { parse, visit }) {
  const ast = parse(source);

  return visit(ast, env => {
    let { builders: b } = env.syntax;

    return {
      MustacheStatement() {
        return b.mustache(b.path('wat-wat'));
      },
    };
  });
};
```

## SemVer Policy

Due to usage of TypeScript and bundling external APIs this project has somewhat
unique SemVer commitments. A high level summary is:

### Major Version

The following are scenarios that would cause a major version (aka breaking change) release:

* Dropping support for Node versions (e.g. dropping Node 10 support)
* Non-additive changes to the underlying AST (which we bundle from `@glimmer/syntax`)
* Breaking changes to the `@glimmer/syntax` builder APIs

### Minor Version

The following are scenarios that would cause a minor version (aka new feature) release:

* Changes to TypeScript version used internally by `ember-template-recast`
* Changes to make the types used by `ember-template-recast` to be more accurate
  (e.g. narrowing / broadening of previously published types).
* Adding new features

### Patch Version

The following are scenarios that would cause a patch release:

* Bug fixes to internal re-writing logic
* Bug fix releases of `@glimmer/syntax`

## License

This project is distributed under the MIT license, see [LICENSE](./LICENSE) for details.
