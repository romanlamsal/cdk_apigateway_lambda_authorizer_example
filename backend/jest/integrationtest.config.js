module.exports = {
    "verbose": true,
    "rootDir": "../",
    "testPathIgnorePatterns": ["/node_modules/", "/src/test"],
    "collectCoverageFrom": ["src/impl/**/*", "src/types/**/*"],
    "globalSetup": "<rootDir>/jest/startContainer.js",
    "setupFilesAfterEnv": ["<rootDir>/jest/setupIntegrationTest.js"],
    "globalTeardown": "<rootDir>/jest/terminateContainer.js",
};
