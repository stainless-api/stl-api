import ts, { factory } from "typescript";

// create name property
const nameProp = factory.createPropertySignature(
  undefined,
  factory.createIdentifier("name"),
  undefined,
  factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
);

// create age property
const ageProp = factory.createPropertySignature(
  undefined,
  factory.createIdentifier("age"),
  undefined,
  factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)
);

// create User type
const userType = factory.createTypeAliasDeclaration(
  [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
  factory.createIdentifier("User"),
  undefined,
  factory.createTypeLiteralNode([nameProp, ageProp])
);

const userProp = factory.createPropertySignature(
  undefined,
  factory.createIdentifier("user"),
  undefined,
  factory.createTypeReferenceNode(factory.createIdentifier("User"), undefined)
);

const adminType = factory.createTypeAliasDeclaration(
  [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
  factory.createIdentifier("Admin"),
  undefined,
  factory.createTypeLiteralNode([userProp])
);

export function generateOutput() {
  const nodes = factory.createNodeArray([userType, adminType]);

  const sourceFile = ts.createSourceFile(
    "placeholder.ts",
    "",
    ts.ScriptTarget.ESNext,
    true,
    ts.ScriptKind.TS
  );

  const printer = ts.createPrinter();

  const outputFile = printer.printList(
    ts.ListFormat.MultiLine,
    nodes,
    sourceFile
  );
  return outputFile;
}
