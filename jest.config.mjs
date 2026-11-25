import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

export default createJestConfig({
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.ts', '<rootDir>/tests/**/*.test.tsx'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  collectCoverageFrom: [
    'src/app/api/cv/generate/route.ts',
    'src/lib/cv-ats-adapter.ts',
    'src/lib/cv-draft-privacy.ts',
    'src/lib/cv-file.ts',
    'src/lib/cv-release-checklist.ts',
    'src/lib/cv-schema.ts',
    'src/lib/cv-storage.ts',
    'src/components/hero-shader-canvas.tsx',
  ],
  coverageDirectory: 'coverage',
});
