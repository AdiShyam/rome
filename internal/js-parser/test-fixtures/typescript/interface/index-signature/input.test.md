# `index.test.ts`

**DO NOT MODIFY**. This file has been autogenerated. Run `rome test internal/js-parser/index.test.ts --update-snapshots` to update.

## `typescript > interface > index-signature`

### `ast`

```javascript
JSRoot {
	comments: Array []
	corrupt: false
	diagnostics: Array []
	directives: Array []
	filename: "typescript/interface/index-signature/input.ts"
	hasHoistedVars: false
	interpreter: undefined
	mtime: undefined
	sourceType: "module"
	syntax: Array ["ts"]
	loc: Object {
		filename: "typescript/interface/index-signature/input.ts"
		end: Object {
			column: 0
			line: 4
		}
		start: Object {
			column: 0
			line: 1
		}
	}
	body: Array [
		TSInterfaceDeclaration {
			id: JSBindingIdentifier {
				name: "I"
				loc: Object {
					filename: "typescript/interface/index-signature/input.ts"
					identifierName: "I"
					end: Object {
						column: 11
						line: 1
					}
					start: Object {
						column: 10
						line: 1
					}
				}
			}
			extends: undefined
			typeParameters: undefined
			loc: Object {
				filename: "typescript/interface/index-signature/input.ts"
				end: Object {
					column: 1
					line: 3
				}
				start: Object {
					column: 0
					line: 1
				}
			}
			body: TSInterfaceBody {
				loc: Object {
					filename: "typescript/interface/index-signature/input.ts"
					end: Object {
						column: 1
						line: 3
					}
					start: Object {
						column: 12
						line: 1
					}
				}
				body: Array [
					TSIndexSignature {
						key: JSBindingIdentifier {
							name: "s"
							loc: Object {
								filename: "typescript/interface/index-signature/input.ts"
								end: Object {
									column: 14
									line: 2
								}
								start: Object {
									column: 5
									line: 2
								}
							}
							meta: JSPatternMeta {
								loc: Object {
									filename: "typescript/interface/index-signature/input.ts"
									end: Object {
										column: 14
										line: 2
									}
									start: Object {
										column: 5
										line: 2
									}
								}
								typeAnnotation: TSStringKeywordTypeAnnotation {
									loc: Object {
										filename: "typescript/interface/index-signature/input.ts"
										end: Object {
											column: 14
											line: 2
										}
										start: Object {
											column: 8
											line: 2
										}
									}
								}
							}
						}
						readonly: false
						loc: Object {
							filename: "typescript/interface/index-signature/input.ts"
							end: Object {
								column: 24
								line: 2
							}
							start: Object {
								column: 4
								line: 2
							}
						}
						typeAnnotation: TSNumberKeywordTypeAnnotation {
							loc: Object {
								filename: "typescript/interface/index-signature/input.ts"
								end: Object {
									column: 23
									line: 2
								}
								start: Object {
									column: 17
									line: 2
								}
							}
						}
					}
				]
			}
		}
	]
}
```

### `diagnostics`

```
✔ No known problems!

```
