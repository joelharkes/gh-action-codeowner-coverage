export interface CodeOwnerRule {
  pattern: string;
  owners: string[];
  isMatch(file: string): boolean;
  lineNumber: number;
}

export function parseCodeowners(content: string): CodeOwnerRule[] {
  const lines = content.split('\n');
  const rules: CodeOwnerRule[] = [];

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      return;
    }
    if (trimmedLine.startsWith('#')) {
      return;
    }

    const [pattern, ...owners] = trimmedLine.split(/\s+/);

    rules.push({
      pattern,
      owners,
      isMatch: makeMatcher(pattern),
      lineNumber: index + 1,
    });
  });

  return rules;
}

export function makeMatcher(pattern: string): (file: string) => boolean {
  if (pattern === '*') {
    return () => true;
  }
  if (!pattern.includes('*')) {
    if (pattern.startsWith('/')) {
      return (file: string) => file.startsWith(pattern);
    }
    return (file: string) => file.includes(pattern);
  }
  if (!pattern.includes('/') && pattern.startsWith('*')) {
    return (file: string) => file.endsWith(pattern.slice(1));
  }

  if (!pattern.startsWith('/') && !pattern.startsWith('*')) {
    pattern = `**/` + pattern; // we match preceding directory
  }
  if (!pattern.endsWith('*')) {
    pattern = pattern + '**'; // we match all subdirectories (we are never sure if we match specific file or directory)
  }

  // Escape special regex characters
  let regexPattern = pattern.replace(/[-/\\^$+?.()|[\]{}*]/g, '\\$&');

  // Replace ** with a pattern that matches any character, including slashes
  regexPattern = regexPattern.replace(/\\\*\\\*/g, '.*');

  // Replace * with a pattern that matches any character except slashes
  regexPattern = regexPattern.replace(/\\\*/g, '[^/]*');

  // Ensure the pattern matches from the start to the end of the string
  regexPattern = `^${regexPattern}$`;

  const regex = new RegExp(regexPattern);

  return (file: string) => regex.test(file);
}
