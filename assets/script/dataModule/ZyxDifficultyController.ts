import { gridContentType } from '../define/TypeDefine';
import NewUtils from '../util/NewUtils';

export type typeDifficultyProduceInput = {
    score: number,
    gridInfo: any[],
    previousLevel: number,
    generatedRows: number,
    noMergeStreak: number,
    reliefRows: number,
    comboTimes: number,
}

export type typeDifficultyProduceResult = {
    segments: number[],
    level: number,
    generatedRows: number,
    noMergeStreak: number,
    reliefRows: number,
    balanceTriggered: boolean,
    balanceReason: string,
    pressure: typeBoardPressure,
    targetFill: number,
    difficultyChanged: boolean,
    drillFragmentIndex: number,
}

export type typeBoardPressure = {
    occupiedCells: number,
    stackHeight: number,
    largeCellRatio: number,
    emptyCells: number,
}

type typeDifficultyProfile = {
    level: number,
    min: number,
    max: number,
    targetFill: number,
    weights: number[],
}

const DIFFICULTY_PROFILES: typeDifficultyProfile[] = [
    { level: 1, min: 0, max: 25, targetFill: 4, weights: [30, 31, 25, 12, 2] },
    { level: 2, min: 26, max: 70, targetFill: 4, weights: [26, 29, 27, 15, 3] },
    { level: 3, min: 71, max: 150, targetFill: 5, weights: [22, 27, 29, 17, 5] },
    { level: 4, min: 151, max: 320, targetFill: 5, weights: [19, 25, 30, 20, 6] },
    { level: 5, min: 321, max: 700, targetFill: 6, weights: [16, 22, 31, 23, 8] },
    { level: 6, min: 701, max: 1400, targetFill: 6, weights: [14, 20, 30, 25, 11] },
    { level: 7, min: 1401, max: 2800, targetFill: 6, weights: [12, 18, 30, 27, 13] },
    { level: 8, min: 2801, max: 5500, targetFill: 7, weights: [10, 17, 29, 28, 16] },
    { level: 9, min: 5501, max: 10000, targetFill: 7, weights: [8, 15, 29, 30, 18] },
    { level: 10, min: 10001, max: Number.MAX_SAFE_INTEGER, targetFill: 7, weights: [7, 14, 28, 31, 20] },
];

export default class ZyxDifficultyController {
    public getLevel(score: number, generatedRows: number = 0): number {
        return this.getProfile(score, generatedRows).level;
    }

    public produceSegments(input: typeDifficultyProduceInput): typeDifficultyProduceResult {
        const profile = this.getProfile(input.score, input.generatedRows);
        const pressure = this.analyzeBoard(input.gridInfo);
        const oldLevel = input.previousLevel || profile.level;
        let reliefRows = Math.max(0, input.reliefRows || 0);
        let balanceTriggered = false;
        let balanceReason = '';

        if (this.shouldTriggerRelief(pressure, input.noMergeStreak)) {
            reliefRows = Math.max(reliefRows, pressure.stackHeight >= 7 || pressure.emptyCells <= 16 ? 3 : 2);
            balanceTriggered = true;
            balanceReason = '动态平衡触发';
        }

        const weights = profile.weights.slice();
        let targetFill = profile.targetFill;
        const phase = (input.generatedRows + profile.level) % 7;

        if (reliefRows > 0) {
            weights[0] += 24;
            weights[1] += 18;
            weights[2] += 10;
            weights[3] = Math.max(2, weights[3] - 15);
            weights[4] = Math.max(0, weights[4] - 12);
            targetFill = Math.max(2, targetFill - 2);
            reliefRows -= 1;
        } else if (phase === 2 || phase === 3) {
            weights[0] = Math.max(4, weights[0] - 8);
            weights[3] += 6;
            weights[4] += 4;
            targetFill = Math.min(8, targetFill + 1);
        } else if (phase === 6) {
            weights[0] += 10;
            weights[1] += 8;
            weights[3] = Math.max(2, weights[3] - 6);
            weights[4] = Math.max(0, weights[4] - 5);
            targetFill = Math.max(2, targetFill - 1);
        }

        if (input.comboTimes >= 2) {
            weights[0] += 8;
            weights[1] += 8;
            weights[2] += 4;
            weights[3] = Math.max(2, weights[3] - 7);
            weights[4] = Math.max(0, weights[4] - 5);
        }

        const segments = this.createLineSegments(weights, targetFill);
        const drillFragmentIndex = this.pickDrillFragmentIndex(segments);
        return {
            segments,
            level: profile.level,
            generatedRows: (input.generatedRows || 0) + 1,
            noMergeStreak: input.noMergeStreak || 0,
            reliefRows,
            balanceTriggered,
            balanceReason,
            pressure,
            targetFill,
            difficultyChanged: oldLevel !== profile.level,
            drillFragmentIndex,
        };
    }

    public analyzeBoard(gridInfo: any[]): typeBoardPressure {
        let occupiedCells = 0;
        let largeCells = 0;
        let firstOccupiedRow = -1;
        for (let row = 0; row < gridInfo.length; row++) {
            for (let col = 0; col < gridInfo[row].length; col++) {
                const cell = gridInfo[row][col];
                if (cell[1] !== gridContentType.EMPTY) {
                    occupiedCells++;
                    if (cell[0] >= 3) largeCells++;
                    if (firstOccupiedRow === -1) firstOccupiedRow = row;
                }
            }
        }
        return {
            occupiedCells,
            stackHeight: firstOccupiedRow === -1 ? 0 : gridInfo.length - firstOccupiedRow,
            largeCellRatio: occupiedCells === 0 ? 0 : largeCells / occupiedCells,
            emptyCells: gridInfo.length * 8 - occupiedCells,
        };
    }

    private getProfile(score: number, generatedRows: number = 0): typeDifficultyProfile {
        const safeScore = Math.max(0, score || 0) + Math.max(0, generatedRows || 0) * 18;
        for (let i = 0; i < DIFFICULTY_PROFILES.length; i++) {
            const profile = DIFFICULTY_PROFILES[i];
            if (safeScore >= profile.min && safeScore <= profile.max) return profile;
        }
        return DIFFICULTY_PROFILES[DIFFICULTY_PROFILES.length - 1];
    }

    private shouldTriggerRelief(pressure: typeBoardPressure, noMergeStreak: number): boolean {
        if (pressure.stackHeight >= 7) return true;
        if (pressure.emptyCells <= 16) return true;
        return pressure.stackHeight >= 5
            && pressure.largeCellRatio >= 0.38
            && noMergeStreak >= 3;
    }

    private createLineSegments(weights: number[], targetFill: number): number[] {
        const segments: number[] = [];
        let cells = 0;
        let filled = 0;
        let largeSegments = 0;

        while (cells < 8) {
            const remain = 8 - cells;
            let size = this.weightedSize(weights, remain);

            if (filled >= targetFill && NewUtils.randomIntInclusive(1, 100) <= 72) {
                size = 0;
            }

            if (size >= 3 && largeSegments >= 2 && NewUtils.randomIntInclusive(1, 100) <= 75) {
                size = this.weightedSize([weights[0], weights[1] + 10, weights[2] + 6, 0, 0], remain);
            }

            if (size > 0 && filled + size > targetFill + 1 && NewUtils.randomIntInclusive(1, 100) <= 70) {
                size = remain >= 2 ? 2 : 1;
            }

            if (size <= 0) {
                segments.push(0);
                cells += 1;
            } else {
                segments.push(size);
                cells += size;
                filled += size;
                if (size >= 3) largeSegments += 1;
            }
        }

        if (filled === 0) {
            segments[NewUtils.randomIntInclusive(0, Math.max(0, segments.length - 1))] = 1;
        }
        return segments;
    }

    private pickDrillFragmentIndex(segments: number[]): number {
        const filledIndexes = [];
        for (let i = 0; i < segments.length; i++) {
            if (segments[i] > 0) filledIndexes.push(i);
        }
        if (filledIndexes.length === 0) return -1;
        return filledIndexes[NewUtils.randomIntInclusive(0, filledIndexes.length - 1)];
    }

    private weightedSize(weights: number[], remain: number): number {
        const localWeights = weights.slice(0, Math.min(5, remain + 1));
        if (localWeights.length < 5) {
            for (let i = localWeights.length; i < 5; i++) localWeights[i] = 0;
        }
        const total = localWeights.reduce((sum, item) => sum + Math.max(0, item), 0);
        if (total <= 0) return 0;

        let roll = NewUtils.randomIntInclusive(1, total);
        for (let i = 0; i < localWeights.length; i++) {
            roll -= Math.max(0, localWeights[i]);
            if (roll <= 0) return i;
        }
        return 0;
    }
}

export const zyxDifficultyController = new ZyxDifficultyController();
