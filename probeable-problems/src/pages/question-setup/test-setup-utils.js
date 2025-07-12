const inputCVariables = (problem, testTemplate, splitString) => {
    const generatedTests = problem.testSuite.map((test, i) => `
    void test_${i + 1}() {
        ${test.code}
    }
    `).join('\n');

    const switchTests = problem.testSuite.map((_, i) => `
        case ${i}: test_${i + 1}(); break;
    `).join('\n');

    const template = testTemplate.template.replace(
        '//VAR_IMPLEMENTATION',
        problem.modelAnswer
    ).replace(
        '//VAR_SPLIT',
        splitString
    ).replace(
        '//VAR_NUM_TESTS',
        problem?.testSuite?.length.toString()
    ).replace(
        '//VAR_TESTS',
        generatedTests
    ).replace(
        '//VAR_SWITCH_TESTS',
        switchTests
    );

    return template;
}

export const createTestSuiteFromFile = (problem, testTemplate, splitString, language) => {
    let testSuiteFromFile
    switch (language) {
        case 'c':
            testSuiteFromFile = inputCVariables(problem, testTemplate, splitString);
            break;
        case 'java':
            //TODO
            break;
        default:
            //TODO
            break;
    }
    return testSuiteFromFile;
}