module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      "@babel/typescript",
      "@babel/react",
      [
      "@babel/env",
      {
        targets: {
          browsers: [
              ">0.25%",
              "not ie 11"
          ]
        },
        useBuiltIns: "usage"
      }]
    ],
    plugins: [
      "@babel/proposal-class-properties",
      "@babel/proposal-object-rest-spread",
      "@babel/plugin-syntax-dynamic-import",
      "@babel/plugin-transform-runtime",
      "@babel/plugin-transform-typescript"
    ]
  };
}
