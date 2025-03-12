/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * To mock dependencies in ESM, you can create fixtures that export mock
 * functions and objects. For example, the core module is mocked in this test,
 * so that the actual '@actions/core' module is not imported.
 */
import { jest } from '@jest/globals';
import * as core from '../__fixtures__/core.js';

// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule('@actions/core', () => core);

// The module being tested should be imported dynamically. This ensures that the
// mocks are used in place of any actual dependencies.
const { runAction } = await import('../src/main.js');

test('can run successfully', async () => {
  core.isDebug.mockReturnValue(false);
  runAction({
    includeGitignore: false,
    ignoreDefault: false,
    files: `root/file1.js file.md`,
    allRulesMustHit: false,
    codeownersContent: `
    /root @owner3
    *.md @owner4
    `,
  });

  // expect 4 group calls
  expect(core.startGroup).toHaveBeenCalledTimes(5);
  expect(core.endGroup).toHaveBeenCalledTimes(5);
  expect(core.error).toHaveBeenCalledTimes(0);
  expect(core.setOutput.mock.calls[0][0]).toBe('missedFiles');
  expect(core.setOutput.mock.calls[0][1]).toBe(``);
  expect(core.setFailed).toHaveBeenCalledTimes(0);
});

test('fails on missing files', async () => {
  core.isDebug.mockReturnValue(false);
  runAction({
    includeGitignore: false,
    ignoreDefault: true,
    files: `root/file1.js file.js file.md any/file.md not/root/missed.js folder/file.js notroot/folder/file.js`,
    allRulesMustHit: true,
    codeownersContent: `#comment
    * @all-ignored
    folder @owner1
    /root @owner3
    *.md @owner4
    `,
  });

  // expect 4 group calls
  expect(core.startGroup).toHaveBeenCalledTimes(5);
  expect(core.endGroup).toHaveBeenCalledTimes(5);
  expect(core.error).toHaveBeenCalledTimes(2);
  expect(core.error.mock.calls[0][1]!.file).toBe('/file.js');
  expect(core.error.mock.calls[1][1]!.file).toBe('/not/root/missed.js');
  expect(core.setOutput.mock.calls[0][0]).toBe('missedFiles');
  expect(core.setOutput.mock.calls[0][1]).toBe(`/file.js\n/not/root/missed.js`);
  expect(core.setFailed).toHaveBeenCalledTimes(1);
});

test('fails on unused codeowner rules', async () => {
  core.isDebug.mockReturnValue(false);
  runAction({
    includeGitignore: false,
    ignoreDefault: true,
    files: `root/file.js file.md`,
    allRulesMustHit: true,
    codeownersContent: `#comment
    * @all-ignored
    folder @owner1
    /root @owner3
    *.md @owner4
    `,
  });

  // expect 4 group calls
  expect(core.startGroup).toHaveBeenCalledTimes(5);
  expect(core.endGroup).toHaveBeenCalledTimes(5);
  expect(core.error).toHaveBeenCalledTimes(1);
  expect(core.error.mock.calls[0][1]!.file).toBe('CODEOWNERS');
  expect(core.error.mock.calls[0][1]!.startLine).toBe(3);
  expect(core.error.mock.calls[0][0]).toBe('Rule not used: folder');
  expect(core.setOutput.mock.calls[0][0]).toBe('missedFiles');
  expect(core.setOutput.mock.calls[0][1]).toBe(``);
  expect(core.setFailed).toHaveBeenCalledTimes(1);
});
