export interface CodeOwnerRule {
    pattern: string;
    owners: string[];
    isMatch(file: string): boolean;
    lineNumber: number;
}
export declare function parseCodeowners(content: string): CodeOwnerRule[];
export declare function makeMatcher(pattern: string): (file: string) => boolean;
