module.exports = {
  extends: ["eslint-config-ts-base"],
  parser: "babel-eslint",
  globals: {
    Babel: true,
    React: true,
  },
  rules: {
    semi: 0,
    "no-alert": 0
  },
  env: {
    browser: true,
    es6: true,
    node: true
  },

  plugins: ["react", "import", "react-hooks", "jsx-a11y", "babel"],
};
