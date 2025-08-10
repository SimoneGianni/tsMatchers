/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
    // Automatically clear mock calls and instances between every test
    clearMocks: true,
  
    // Indicates whether the coverage information should be collected while executing the test
    collectCoverage: true,
  
    // The directory where Jest should output its coverage files
    coverageDirectory: "coverage",
    
    // Use ts-jest preset for TypeScript files
    preset: 'ts-jest',
    
    // Set test environment
    testEnvironment: 'node',
    
    // Transform files using ts-jest
    extensionsToTreatAsEsm: ['.ts'],
    
    // Module file extensions
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    
    // Transform configuration
    transform: {
        '^.+\\.ts$': ['ts-jest', {
            useESM: true
        }]
    }
};
