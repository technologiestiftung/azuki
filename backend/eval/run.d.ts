import type { EvalSnapshot, Occupation } from "@azuki/shared";
export interface RunEvalOptions {
    systemPrompt: string;
    model: string;
    occupations: Occupation[];
}
export declare function runEval(opts: RunEvalOptions): Promise<EvalSnapshot>;
