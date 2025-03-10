import { parseCodeowners, makeMatcher } from '../src/codeowner.js';

describe('parseCodeowners', () => {
  it('should parse CODEOWNERS content into rules', () => {
    const content = `
      # This is a comment
      * @global-owner1 @global-owner2
      *.js @js-owner
      /build/logs/ @doctocat
      **/logs @octocat
    `;

    const rules = parseCodeowners(content);

    expect(rules).toHaveLength(4);
    expect(rules[0]).toEqual({
      pattern: '*',
      owners: ['@global-owner1', '@global-owner2'],
      isMatch: expect.any(Function),
      lineNumber: 3,
    });
    expect(rules[1]).toEqual({
      pattern: '*.js',
      owners: ['@js-owner'],
      isMatch: expect.any(Function),
      lineNumber: 4,
    });
    expect(rules[2]).toEqual({
      pattern: '/build/logs/',
      owners: ['@doctocat'],
      isMatch: expect.any(Function),
      lineNumber: 5,
    });
    expect(rules[3]).toEqual({
      pattern: '**/logs',
      owners: ['@octocat'],
      isMatch: expect.any(Function),
      lineNumber: 6,
    });
  });
});

describe('makeMatcher', () => {
  it('should match files correctly for * pattern', () => {
    const matcher = makeMatcher('*');
    expect(matcher('/file.txt')).toBe(true);
    expect(matcher('/dir/file.txt')).toBe(true);
  });

  it('should match files correctly for *.js pattern', () => {
    const matcher = makeMatcher('*.js');
    expect(matcher('/file.js')).toBe(true);
    expect(matcher('/file.txt')).toBe(false);
    expect(matcher('/dir/file.js')).toBe(true);
  });

  it('should match files correctly for /build/logs/ pattern', () => {
    const matcher = makeMatcher('/build/logs/');
    expect(matcher('/build/logs/file.txt')).toBe(true);
    expect(matcher('/build/logs/dir/file.txt')).toBe(true);
    expect(matcher('/logs/file.txt')).toBe(false);
  });

  it('should match files correctly for **/logs pattern', () => {
    const matcher = makeMatcher('**/logs');
    expect(matcher('/test/logs')).toBe(true);
    expect(matcher('/logs/file.txt')).toBe(true);
    expect(matcher('/build/logs/file.txt')).toBe(true);
    expect(matcher('/dir/build/logs/file.txt')).toBe(true);
    expect(matcher('/file.txt')).toBe(false);
  });

  it('should match files correctly for /logs/** pattern', () => {
    const matcher = makeMatcher('/logs/**');
    expect(matcher('/logs/file.txt')).toBe(true);
    expect(matcher('/build/logs/file.txt')).toBe(false);
    expect(matcher('/logs/build/test/file.txt')).toBe(true);
    expect(matcher('/file.txt')).toBe(false);
  });

  it('should match files correctly for logs/** pattern', () => {
    const matcher = makeMatcher('logs/**');
    expect(matcher('/logs/file.txt')).toBe(true);
    expect(matcher('/build/logs/file.txt')).toBe(true);
    expect(matcher('/logs/build/test/file.txt')).toBe(true);
    expect(matcher('/file.txt')).toBe(false);
  });

  it('should match files correctly for docs/* pattern', () => {
    const matcher = makeMatcher('docs/*');
    expect(matcher('/docs/file.txt')).toBe(true);
    expect(matcher('/docs/dir/file.txt')).toBe(false);
    expect(matcher('/test/docs/file.txt')).toBe(true);
    expect(matcher('/file.txt')).toBe(false);
  });

  it('should match files correctly for /docs/ pattern', () => {
    const matcher = makeMatcher('/docs/');
    expect(matcher('/docs/file.txt')).toBe(true);
    expect(matcher('/docs/dir/file.txt')).toBe(true);
    expect(matcher('/file.txt')).toBe(false);
  });
});
