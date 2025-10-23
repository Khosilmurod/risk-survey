/**
 * Phase2Generator.js - Personalized Trial Generation
 * 
 * Generates Phase 2 trials tailored to participant's estimated alpha
 * Focuses on risky vs safe choices near their indifference points
 */

class Phase2Generator {
    constructor(estimatedAlpha) {
        this.alpha = estimatedAlpha;
        this.trials = [];
    }

    /**
     * Calculate Expected Utility
     */
    calculateEU(amount, alpha = this.alpha) {
        return Math.pow(amount, alpha);
    }

    /**
     * Calculate risky option's expected utility
     */
    calculateRiskyEU(riskyAmount, probability, alpha = this.alpha) {
        return (probability / 100) * this.calculateEU(riskyAmount, alpha);
    }

    /**
     * Find the indifference point (certainty equivalent)
     * The safe amount where participant should be indifferent
     */
    findIndifferencePoint(riskyAmount, probability) {
        const riskyEU = this.calculateRiskyEU(riskyAmount, probability);
        // Solve: safe^α = riskyEU
        // safe = riskyEU^(1/α)
        const indifferencePoint = Math.pow(riskyEU, 1 / this.alpha);
        return Math.round(indifferencePoint);
    }

    /**
     * Generate safe amounts bracketing the indifference point
     * Creates 7 safe options: 3 below, 1 at, 3 above the indifference point
     */
    generateBracketedSafeAmounts(indifferencePoint, riskyAmount) {
        const safeAmounts = [];
        
        // Determine bracket width based on amount magnitude
        let bracketWidth;
        if (riskyAmount < 200) {
            bracketWidth = Math.ceil(indifferencePoint * 0.15); // 15% steps for small amounts
        } else if (riskyAmount < 1000) {
            bracketWidth = Math.ceil(indifferencePoint * 0.12); // 12% steps
        } else if (riskyAmount < 100000) {
            bracketWidth = Math.ceil(indifferencePoint * 0.10); // 10% steps
        } else {
            bracketWidth = Math.ceil(indifferencePoint * 0.08); // 8% steps for large amounts
        }

        // Generate 7 safe amounts bracketing indifference point
        for (let i = -3; i <= 3; i++) {
            const safeAmount = Math.max(1, Math.round(indifferencePoint + (i * bracketWidth)));
            safeAmounts.push(safeAmount);
        }

        return safeAmounts;
    }

    /**
     * Generate Phase 2 trials for a specific risky amount and probability
     */
    generateTrialsForCondition(riskyAmount, probability, trialIdStart) {
        const indifferencePoint = this.findIndifferencePoint(riskyAmount, probability);
        const safeAmounts = this.generateBracketedSafeAmounts(indifferencePoint, riskyAmount);

        const trials = [];
        safeAmounts.forEach((safeAmount, index) => {
            trials.push({
                trial_id: trialIdStart + index,
                risky_amount: riskyAmount,
                risky_probability: probability,
                risky_EV: Math.round((probability / 100) * riskyAmount),
                safe_amount: safeAmount,
                indifference_point: indifferencePoint,
                estimated_alpha: this.alpha
            });
        });

        return trials;
    }

    /**
     * Generate full Phase 2 trial set (similar structure to Phase 1)
     * Uses 6 risky amounts × 3 probabilities × 7 safe brackets = 126 trials
     */
    generatePhase2Trials() {
        const riskyAmounts = [120, 180, 300, 1600000, 2000000, 7200000];
        const probabilities = [25, 50, 75];
        
        let trialId = 1;
        
        for (const riskyAmount of riskyAmounts) {
            for (const probability of probabilities) {
                const conditionTrials = this.generateTrialsForCondition(
                    riskyAmount, 
                    probability, 
                    trialId
                );
                this.trials.push(...conditionTrials);
                trialId += conditionTrials.length;
            }
        }

        console.log(`Generated ${this.trials.length} Phase 2 trials for alpha=${this.alpha.toFixed(3)}`);
        return this.trials;
    }

    /**
     * Generate a subset of Phase 2 trials (for shorter experiments)
     */
    generatePhase2TrialsSubset(numConditions = 3) {
        // Select a subset of risky amounts (mix of small and large)
        const riskyAmounts = [120, 300, 2000000];
        const probabilities = [25, 50, 75];
        
        let trialId = 1;
        
        for (const riskyAmount of riskyAmounts.slice(0, numConditions)) {
            for (const probability of probabilities) {
                const conditionTrials = this.generateTrialsForCondition(
                    riskyAmount, 
                    probability, 
                    trialId
                );
                this.trials.push(...conditionTrials);
                trialId += conditionTrials.length;
            }
        }

        console.log(`Generated ${this.trials.length} Phase 2 trials (subset) for alpha=${this.alpha.toFixed(3)}`);
        return this.trials;
    }

    /**
     * Export trials as CSV string
     */
    exportAsCSV() {
        const header = 'trial_id,risky_amount,risky_probability,risky_EV,safe_amount,indifference_point,estimated_alpha\n';
        const rows = this.trials.map(trial => 
            `${trial.trial_id},${trial.risky_amount},${trial.risky_probability},${trial.risky_EV},${trial.safe_amount},${trial.indifference_point},${trial.estimated_alpha}`
        ).join('\n');
        
        return header + rows;
    }

    /**
     * Get trials in format compatible with existing experiment code
     */
    getTrialsForExperiment() {
        return this.trials.map(trial => ({
            trial_id: trial.trial_id,
            risk_probability: trial.risky_probability,
            risk_reward: trial.risky_amount,
            safe_reward: trial.safe_amount,
            expected_value: trial.safe_amount, // For EV comparison
            size_condition: 'both-large', // Can be randomized if needed
            combination_id: Math.floor((trial.trial_id - 1) / 7) + 1 // Group by condition
        }));
    }
}

// Make available to experiment
if (typeof window !== 'undefined') {
    window.Phase2Generator = Phase2Generator;
}