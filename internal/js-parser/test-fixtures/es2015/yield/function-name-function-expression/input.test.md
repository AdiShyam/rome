# `index.test.ts`

**DO NOT MODIFY**. This file has been autogenerated. Run `rome test internal/js-parser/index.test.ts --update-snapshots` to update.

## `es2015 > yield > function-name-function-expression`

### `ast`

```javascript
JSRoot {
	comments: Array []
	corrupt: false
	diagnostics: Array []
	directives: Array []
	filename: "es2015/yield/function-name-function-expression/input.js"
	hasHoistedVars: false
	interpreter: undefined
	mtime: undefined
	sourceType: "script"
	syntax: Array []
	loc: Object {
		filename: "es2015/yield/function-name-function-expression/input.js"
		end: Object {
			column: 20
			line: 1
		}
		start: Object {
			column: 0
			line: 1
		}
	}
	body: Array [
		JSExpressionStatement {
			loc: Object {
				filename: "es2015/yield/function-name-function-expression/input.js"
				end: Object {
					column: 20
					line: 1
				}
				start: Object {
					column: 0
					line: 1
				}
			}
			expression: JSUnaryExpression {
				operator: "+"
				prefix: true
				loc: Object {
					filename: "es2015/yield/function-name-function-expression/input.js"
					end: Object {
						column: 20
						line: 1
					}
					start: Object {
						column: 0
						line: 1
					}
				}
				argument: JSFunctionExpression {
					id: JSBindingIdentifier {
						name: "yield"
						loc: Object {
							filename: "es2015/yield/function-name-function-expression/input.js"
							identifierName: "yield"
							end: Object {
								column: 15
								line: 1
							}
							start: Object {
								column: 10
								line: 1
							}
						}
					}
					loc: Object {
						filename: "es2015/yield/function-name-function-expression/input.js"
						end: Object {
							column: 20
							line: 1
						}
						start: Object {
							column: 1
							line: 1
						}
					}
					body: JSBlockStatement {
						body: Array []
						directives: Array []
						loc: Object {
							filename: "es2015/yield/function-name-function-expression/input.js"
							end: Object {
								column: 20
								line: 1
							}
							start: Object {
								column: 18
								line: 1
							}
						}
					}
					head: JSFunctionHead {
						async: false
						generator: false
						hasHoistedVars: false
						params: Array []
						rest: undefined
						returnType: undefined
						thisType: undefined
						typeParameters: undefined
						loc: Object {
							filename: "es2015/yield/function-name-function-expression/input.js"
							end: Object {
								column: 17
								line: 1
							}
							start: Object {
								column: 15
								line: 1
							}
						}
					}
				}
			}
		}
	]
}
```

### `diagnostics`

```
✔ No known problems!

```
