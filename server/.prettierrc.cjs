// prettier.config.cjs

module.exports = {
  // Use single quotes ' instead of double quotes "
  singleQuote: true,

  // Do not automatically add semicolons ;
  // Matches modern Node.js style
  semi: false,

  // Maximum line length before wrapping
  printWidth: 100,

  // Add trailing commas in objects/arrays (ES5+)
  // Makes git diffs cleaner when adding new lines
  trailingComma: 'es5',

  // Include spaces inside object braces
  // Example: { a: 1 } instead of {a:1}
  bracketSpacing: true,

  // Always include parentheses for arrow functions
  // Example: (x) => x * 2 (clear, easy to extend)
  arrowParens: 'always',

  // Enforce LF line endings
  // Avoid cross-OS differences between Windows/Linux/Mac
  endOfLine: 'lf',
}
