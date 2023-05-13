import nextJest from 'next/jest';
import { Config } from 'jest';

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
    dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig: Config = {
    // Add more setup options before each test is run by adding '<rootDir>/jest.setup.ts' to setupFilesAfterEnv
    setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
    // if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
    moduleDirectories: ['node_modules', '<rootDir>/'],
    testEnvironment: 'jest-environment-jsdom',
    fakeTimers: { enableGlobally: true },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
