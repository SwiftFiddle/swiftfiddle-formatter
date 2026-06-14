"use strict";

const form = document.querySelector("form");

export function buildConfiguration() {
  const configuration = JSON.parse(JSON.stringify(Configuration.default));

  [...form.getElementsByTagName("input")].forEach((input) => {
    if (input.id === "indentationCount") {
      if (input.value) {
        const indent = document.getElementById("indentation").textContent;
        if (indent) {
          const indentation = {};
          indentation[indent.toLowerCase()] = parseInt(input.value);
          configuration["indentation"] = indentation;
        }
      }
    } else if (input.id === "allowedFunctions") {
      if (input.value.trim()) {
        configuration["noAssignmentInExpressions"] = {
          allowedFunctions: input.value
            .split(",")
            .map((name) => name.trim())
            .filter((name) => name),
        };
      }
    } else if (input.type === "checkbox") {
      if (input.id in configuration.rules) {
        configuration.rules[input.id] = input.checked;
      } else {
        configuration[input.id] = input.checked;
      }
    } else {
      if (input.value) {
        configuration[input.id] = parseInt(input.value);
      }
    }
  });

  const accessLevel = document.getElementById(
    "fileScopedDeclarationPrivacy"
  ).textContent;
  configuration["fileScopedDeclarationPrivacy"] = { accessLevel: accessLevel };

  configuration["reflowMultilineStringLiterals"] = document.getElementById(
    "reflowMultilineStringLiterals"
  ).textContent;

  return configuration;
}

export function resetConfiguration() {
  const configuration = JSON.parse(JSON.stringify(Configuration.default));

  [...form.getElementsByTagName("input")].forEach((input) => {
    if (input.id === "indentationCount") {
      input.value = null;
      document.getElementById("indentation").textContent = "Spaces";
    } else if (input.type === "checkbox") {
      if (input.id in configuration.rules) {
        input.checked = configuration.rules[input.id];
      } else {
        input.checked = !!configuration[input.id];
      }
    } else {
      input.value = null;
    }
  });

  document.getElementById("fileScopedDeclarationPrivacy").textContent =
    "private";
  document.getElementById("reflowMultilineStringLiterals").textContent =
    "never";

  document.querySelectorAll(".dropdown-list-item").forEach((listItem) => {
    for (let sibling of listItem.parentNode.children) {
      sibling.classList.remove("active-tick");
    }
    for (let sibling of listItem.parentNode.children) {
      for (let child of sibling.children) {
        if (
          child.textContent == "Spaces" ||
          child.textContent == "private" ||
          child.textContent == "never"
        ) {
          sibling.classList.add("active-tick");
        }
      }
    }
  });
}

class Configuration {
  constructor() {}

  // Mirrors the default configuration of swift-format 602.0.0.
  // https://github.com/swiftlang/swift-format/blob/602.0.0/Sources/SwiftFormat/API/Configuration%2BDefault.swift
  static default = {
    version: 1,
    maximumBlankLines: 1,
    lineLength: 100,
    spacesBeforeEndOfLineComments: 2,
    tabWidth: 8,
    indentation: {
      spaces: 2,
    },
    respectsExistingLineBreaks: true,
    lineBreakBeforeControlFlowKeywords: false,
    lineBreakBeforeEachArgument: false,
    lineBreakBeforeEachGenericRequirement: false,
    lineBreakBetweenDeclarationAttributes: false,
    prioritizeKeepingFunctionOutputTogether: false,
    indentConditionalCompilationBlocks: true,
    lineBreakAroundMultilineExpressionChainComponents: false,
    fileScopedDeclarationPrivacy: {
      accessLevel: "private",
    },
    indentSwitchCaseLabels: false,
    spacesAroundRangeFormationOperators: false,
    noAssignmentInExpressions: {
      allowedFunctions: ["XCTAssertNoThrow"],
    },
    multiElementCollectionTrailingCommas: true,
    reflowMultilineStringLiterals: "never",
    indentBlankLines: false,
    rules: {
      AllPublicDeclarationsHaveDocumentation: false,
      AlwaysUseLiteralForEmptyCollectionInit: false,
      AlwaysUseLowerCamelCase: true,
      AmbiguousTrailingClosureOverload: true,
      AvoidRetroactiveConformances: true,
      BeginDocumentationCommentWithOneLineSummary: false,
      DoNotUseSemicolons: true,
      DontRepeatTypeInStaticProperties: true,
      FileScopedDeclarationPrivacy: true,
      FullyIndirectEnum: true,
      GroupNumericLiterals: true,
      IdentifiersMustBeASCII: true,
      NeverForceUnwrap: false,
      NeverUseForceTry: false,
      NeverUseImplicitlyUnwrappedOptionals: false,
      NoAccessLevelOnExtensionDeclaration: true,
      NoAssignmentInExpressions: true,
      NoBlockComments: true,
      NoCasesWithOnlyFallthrough: true,
      NoEmptyLinesOpeningClosingBraces: false,
      NoEmptyTrailingClosureParentheses: true,
      NoLabelsInCasePatterns: true,
      NoLeadingUnderscores: false,
      NoParensAroundConditions: true,
      NoPlaygroundLiterals: true,
      NoVoidReturnOnFunctionSignature: true,
      OmitExplicitReturns: false,
      OneCasePerLine: true,
      OneVariableDeclarationPerLine: true,
      OnlyOneTrailingClosureArgument: true,
      OrderedImports: true,
      ReplaceForEachWithForLoop: true,
      ReturnVoidInsteadOfEmptyTuple: true,
      TypeNamesShouldBeCapitalized: true,
      UseEarlyExits: false,
      UseExplicitNilCheckInConditions: true,
      UseLetInEveryBoundCaseVariable: true,
      UseShorthandTypeNames: true,
      UseSingleLinePropertyGetter: true,
      UseSynthesizedInitializer: true,
      UseTripleSlashForDocumentationComments: true,
      UseWhereClausesInForLoops: false,
      ValidateDocumentationComments: false,
    },
  };
}
