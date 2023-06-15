/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        diagnostics: false,
      },
    ],
  },
  testEnvironment: "node",
  modulePathIgnorePatterns: ["<rootDir>/node_modules/", "/dist/"],
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "/dist/"],
  testMatch: ["**/__tests__/**/*.test.[jt]s?(x)"],
  setupFilesAfterEnv: [],
  watchPathIgnorePatterns: ["<rootDir>/node_modules/"],
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
  verbose: false,
};
