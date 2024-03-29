module.exports = {
    transform: {
        '^.+\\.tsx?$': 'ts-jest'
    },
    preset: 'ts-jest',
    testRegex: '(/tests/.*\\.(test|spec))\\.(js|jsx|ts|tsx)$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    moduleNameMapper: {
        "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/__mocks__/fileMock.js",
        "\\.(css|scss|sass)$": "identity-obj-proxy"
    },
    setupFiles: ["./tests/setup-jest.ts"]
};