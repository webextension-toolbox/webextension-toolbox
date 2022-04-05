module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["airbnb-base", "prettier"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "class-methods-use-this": "off",
    "import/no-extraneous-dependencies": "off",
    "no-console": "off",
    "no-param-reassign": [
      "error",
      {
        props: true,
        ignorePropertyModificationsFor: ["manifest", "previousValue"],
      },
    ],
  },
  globals: {
    browser: "readonly",
    NodeJS: true,
  },
};
