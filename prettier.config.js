/** @type {import('prettier').Config} */
const prettierConfig = {
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 80,
  tabWidth: 2,
  endOfLine: 'lf',
  arrowParens: 'always',
  plugins: ['prettier-plugin-tailwindcss'],
};

export default prettierConfig;
