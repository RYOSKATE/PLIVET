module.exports = {
    roots: [
        '<rootDir>/test'
    ],
    globals: {
      'ts-jest': {
        tsConfig: 'tsconfig.test.json',
        diagnostics: {
          //NumericInput does not have any construct or call signatures.
          ignoreCodes: [2604]
        }
      }
    },
    transform: {
        '.*\.tsx?$': 'ts-jest'
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
    moduleFileExtensions:[
      "ts",
      "tsx",
      "js",
      "jsx"
    ],
    moduleNameMapper: {
      "\\.(css|less)$": "identity-obj-proxy"
    },
}
