module.exports = {
    env: {
        node: true,
        es2021: true,
    },
    extends: ["eslint:recommended", "plugin:prettier/recommended"],
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
    },
    rules: {
        // Critical code quality (errors)
        "no-undef": "error", // Prevent undefined variable usage
        "no-duplicate-imports": "error", // Prevent duplicate imports
        "no-eval": "error", // Prevent eval() usage
        eqeqeq: ["error", "always"], // Require === instead of ==
        // "no-return-await": "error",            // Prevent redundant await
        "no-var": "error", // Prefer let/const over var
        // "linebreak-style": ["warn", "unix"],
        semi: ["warn", "always"],
        // Line length (balanced)
        "max-len": [
            "warn",
            {
                code: 150, // Reasonable line length
                ignoreComments: true,
                ignoreUrls: true,
                ignoreStrings: true,
                ignoreTemplateLiterals: true,
            },
        ],
        // Spacing (warnings)
        "no-trailing-spaces": "warn",
        "space-before-blocks": "warn",
        "keyword-spacing": "warn",
        "space-infix-ops": "warn",
        "object-curly-spacing": ["warn", "always"],
        "array-bracket-spacing": ["warn", "never"],
        // Variables and naming
        "no-unused-vars": [
            "warn",
            {
                // Warn about unused variables
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
            },
        ],
        // "prefer-const": "warn",                // Suggest const when possible
        // Error handling (balanced)
        "no-useless-catch": "warn",
        "no-fallthrough": "warn",
        "no-prototype-builtins": "warn", // Suggest Object.prototype methods
        // Async/Promise handling
        // "require-await": "warn",               // Warn about async without await
        // Object/Array formatting
        "comma-spacing": [
            "warn",
            {
                before: false,
                after: true,
            },
        ],
        // Comments
        "spaced-comment": ["warn", "always"], // Enforce space after //
    },
};
