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
  modulePathIgnorePatterns: ["<rootDir>/node_modules/", "/dist/", ".next/"],
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "/dist/", ".next/"],
  testMatch: ["**/__tests__/**/*.test.[jt]s?(x)"],
  watchPathIgnorePatterns: ["<rootDir>/node_modules/"],
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
  verbose: false,
};
