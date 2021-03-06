module.exports = {
  extends: ["eslint-config-ts-base"],
  parser: "babel-eslint",
  rules: {
    semi: 0
  },
  env: {
    browser: true,
    es6: true,
    node: true
  },

  plugins: ["babel"],
};
