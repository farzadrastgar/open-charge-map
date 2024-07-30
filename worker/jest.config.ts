// jest.config.js
module.exports = {
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest", // Add this if you're using TypeScript
  },
  extensionsToTreatAsEsm: [".ts"], // Add this if you're using TypeScript
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
  transformIgnorePatterns: ["/node_modules/(?!uuid)"], // Ensures uuid module is transformed
};
