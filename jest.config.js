module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  roots: ['<rootDir>/tests'],  // or just ['<rootDir>'] if your tests are everywhere
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
};
