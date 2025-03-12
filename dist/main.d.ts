interface Input {
    'include-gitignore': boolean;
    'ignore-default': boolean;
    files: string;
    allRulesMustHit: boolean;
    codeownersContent?: string;
}
export declare const runAction: (input: Input) => Promise<void>;
export declare function run(): Promise<void>;
export {};
