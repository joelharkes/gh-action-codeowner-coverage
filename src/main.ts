import * as core from '@actions/core';
import * as glob from '@actions/glob';
import { readFileSync, existsSync } from 'fs';
import { parseCodeowners } from './codeowner.js';

interface Input {
  includeGitignore: boolean;
  ignoreDefault: boolean;
  files: string;
  allRulesMustHit: boolean;
  codeownersContent?: string;
}

function getInputs(): Input {
  return {
    includeGitignore: getBoolInput('includeGitignore'),
    ignoreDefault: getBoolInput('ignoreDefault'),
    allRulesMustHit: getBoolInput('allRulesMustHit'),
    files: core.getInput('files'),
    codeownersContent: core.getInput('codeownersContent'),
  };
}

function getBoolInput(name: string): boolean {
  return core.getInput(name)?.toLowerCase() === 'true';
}

export const runAction = async (input: Input): Promise<void> => {
  let filesToCheck: string[] = [];
  core.startGroup(`Loading files to check.`);
  if (input.files) {
    filesToCheck = input.files
      .split(' ')
      .map((file) => (file.startsWith('/') ? file : `/${file}`));
  } else {
    filesToCheck = await (await glob.create('*')).glob();
    if (input['includeGitignore'] === true) {
      core.info('Ignoring .gitignored files');
      let gitIgnoreFiles: string[] = [];
      if (!existsSync('.gitignore')) {
        core.warning('No .gitignore file found, skipping check.');
      } else {
        const gitIgnoreBuffer = readFileSync('.gitignore', 'utf8');
        const gitIgnoreGlob = await glob.create(gitIgnoreBuffer);
        gitIgnoreFiles = await gitIgnoreGlob.glob();
        core.info(`.gitignore Files: ${gitIgnoreFiles.length}`);
        const lengthBefore = filesToCheck.length;
        filesToCheck = filesToCheck.filter(
          (file) => !gitIgnoreFiles.includes(file),
        );
        const filesIgnored = lengthBefore - filesToCheck.length;
        core.info(`Files Ignored: ${filesIgnored}`);
      }
    }
  }
  core.info(`Found ${filesToCheck.length} files to check.`);
  if (core.isDebug()) {
    core.debug(filesToCheck.join('\n'));
  }
  core.endGroup();

  core.startGroup('Parsing CODEOWNERS File');
  const codeownerContent = input.codeownersContent || getCodeownerContent();
  let parsedCodeowners = parseCodeowners(codeownerContent);
  if (input['ignoreDefault'] === true) {
    parsedCodeowners = parsedCodeowners.filter((rule) => rule.pattern !== '*');
  }
  core.info(`CODEOWNERS Rules: ${parsedCodeowners.length}`);
  core.endGroup();

  core.startGroup('Matching CODEOWNER Files with found files');
  const rulesResult = parsedCodeowners.map((rule) => ({
    rule,
    filtes: [] as string[],
  }));
  rulesResult.reverse(); // last rule takes precedence.
  const missedFiles: string[] = [];
  filesToCheck.forEach((file) => {
    const matchedRule = rulesResult.find(({ rule }) => rule.isMatch(file));
    if (matchedRule) {
      matchedRule.filtes.push(file);
    } else {
      missedFiles.push(file);
    }
  });

  core.info(`${missedFiles.length} files missing codeowners`);
  if (core.isDebug()) {
    core.debug(JSON.stringify(missedFiles));
  }
  core.endGroup();

  core.startGroup('Checking CODEOWNERS Coverage');

  const amountCovered = filesToCheck.length - missedFiles.length;

  const coveragePercent =
    filesToCheck.length === 0
      ? 100
      : (amountCovered / filesToCheck.length) * 100;
  const coverageMessage = `${amountCovered}/${filesToCheck.length}(${coveragePercent.toFixed(2)}%) files covered by CODEOWNERS`;
  core.notice(coverageMessage, {
    title: 'Coverage',
    file: 'CODEOWNERS',
  });
  core.endGroup();
  core.startGroup('Annotating files');
  missedFiles.forEach((file) =>
    core.error(`File not covered by CODEOWNERS: ${file}`, {
      title: 'File mssing in CODEOWNERS',
      file: file,
    }),
  );
  if (missedFiles.length > 0) {
    core.setFailed(
      `${missedFiles.length}/${filesToCheck.length} files not covered in CODEOWNERS`,
    );
  }
  core.setOutput('missedFiles', missedFiles.join('\n'));
  if (input.allRulesMustHit) {
    const unusedRules = rulesResult.filter(({ filtes }) => filtes.length === 0);
    if (unusedRules.length > 0) {
      core.setFailed(`${unusedRules.length} rules not used`);
    }
    unusedRules.forEach(({ rule }) => {
      core.error(`Rule not used: ${rule.pattern}`, {
        title: 'Rule not used',
        file: 'CODEOWNERS',
        startLine: rule.lineNumber,
      });
    });
  }
  core.endGroup();
};

export async function run(): Promise<void> {
  const input = getInputs();
  return runAction(input);
}

function getCodeownerContent(): string {
  if (existsSync('CODEOWNERS')) {
    return readFileSync('CODEOWNERS', 'utf8');
  }
  if (existsSync('.github/CODEOWNERS')) {
    return readFileSync('.github/CODEOWNERS', 'utf8');
  }
  throw new Error('No CODEOWNERS file found');
}
