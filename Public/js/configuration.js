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
    } else if (input.type === "checkbox") {
      configuration[input.id] = input.checked;
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

  return configuration;
}

export function resetConfiguration() {
  const configuration = JSON.parse(JSON.stringify(Configuration.default));

  [...form.getElementsByTagName("input")].forEach((input) => {
    if (input.id === "indentationCount") {
      input.value = null;
      document.getElementById("indentation").textContent = "Spaces";
    } else if (input.type === "checkbox") {
      if (configuration[input.id]) {
        input.checked = configuration[input.id];
      } else {
        input.checked = configuration.rules[input.id];
      }
    } else {
      input.value = null;
    }
  });

  document.getElementById("fileScopedDeclarationPrivacy").textContent =
    "private";

  document.querySelectorAll(".dropdown-list-item").forEach((listItem) => {
    for (let sibling of listItem.parentNode.children) {
      sibling.classList.remove("active-tick");
    }
    for (let sibling of listItem.parentNode.children) {
      for (let child of sibling.children) {
        if (child.textContent == "Spaces" || child.textContent == "private") {
          sibling.classList.add("active-tick");
        }
      }
    }
  });
}

class Configuration {
  constructor() {}

  static default = {
    version: 1,
    maximumBlankLines: 1,
    lineLength: 100,
    tabWidth: 8,
    indentation: {
      spaces: 2,
    },
    respectsExistingLineBreaks: true,
    lineBreakBeforeControlFlowKeywords: false,
    lineBreakBeforeEachArgument: false,
    lineBreakBeforeEachGenericRequirement: false,
    prioritizeKeepingFunctionOutputTogether: false,
    indentConditionalCompilationBlocks: true,
    lineBreakAroundMultilineExpressionChainComponents: false,
    fileScopedDeclarationPrivacy: {
      accessLevel: "private",
    },
    indentSwitchCaseLabels: false,
    rules: {
      AllPublicDeclarationsHaveDocumentation: false,
      AlwaysUseLowerCamelCase: true,
      AmbiguousTrailingClosureOverload: true,
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
      NoBlockComments: true,
      NoCasesWithOnlyFallthrough: true,
      NoEmptyTrailingClosureParentheses: true,
      NoLabelsInCasePatterns: true,
      NoLeadingUnderscores: false,
      NoParensAroundConditions: true,
      NoVoidReturnOnFunctionSignature: true,
      OneCasePerLine: true,
      OneVariableDeclarationPerLine: true,
      OnlyOneTrailingClosureArgument: true,
      OrderedImports: true,
      ReturnVoidInsteadOfEmptyTuple: true,
      UseLetInEveryBoundCaseVariable: true,
      UseShorthandTypeNames: true,
      UseSingleLinePropertyGetter: true,
      UseSynthesizedInitializer: true,
      UseTripleSlashForDocumentationComments: true,
      ValidateDocumentationComments: false,
    },
  };
}
