/**
 * AlphaEstimator.js - Risk Aversion Parameter Estimation
 * 
 * Estimates participant's alpha (α) parameter from Phase 1 choices
 * using Expected Utility Theory: EU = amount^α
 * 
 * Lower α = more risk averse (α=0 extremely risk averse)
 * Higher α = more risk seeking (α=1 risk neutral)
 */

class AlphaEstimator {
    constructor() {
        this.alphaRange = { min: 0.1, max: 1.5, step: 0.05 };
        this.choices = [];
    }

    /**
     * Calculate Expected Utility for a given amount and alpha
     * EU = amount^α
     */
    calculateEU(amount, alpha) {
        return Math.pow(amount, alpha);
    }

    /**
     * Calculate risky option's expected utility
     * Risky EU = probability × (risky_amount^α)
     */
    calculateRiskyEU(riskyAmount, probability, alpha) {
        return (probability / 100) * this.calculateEU(riskyAmount, alpha);
    }

    /**
     * Add a choice from Phase 1 data
     * @param {Object} trial - Trial data containing risky_amount, risk_probability, safe_reward, choice
     */
    addChoice(trial) {
        // Only include trials where participant made a valid choice
        if (trial.choice !== 'risk' && trial.choice !== 'safe') {
            return;
        }

        this.choices.push({
            riskyAmount: trial.risk_reward,
            riskyProbability: trial.risk_probability,
            safeAmount: trial.safe_reward,
            choseRisky: trial.choice === 'risk',
            confidence: trial.confidence
        });
    }

    /**
     * Calculate log-likelihood for a given alpha
     * Higher likelihood = better fit
     */
    calculateLogLikelihood(alpha) {
        let logLikelihood = 0;

        for (const choice of this.choices) {
            const riskyEU = this.calculateRiskyEU(
                choice.riskyAmount, 
                choice.riskyProbability, 
                alpha
            );
            const safeEU = this.calculateEU(choice.safeAmount, alpha);

            // Difference in utility (positive = prefer risky)
            const utilityDiff = riskyEU - safeEU;

            // Softmax probability of choosing risky option
            // Using temperature parameter to control sensitivity
            const temperature = 1.0;
            const pChooseRisky = 1 / (1 + Math.exp(-utilityDiff / temperature));

            // Add log probability to likelihood
            if (choice.choseRisky) {
                logLikelihood += Math.log(pChooseRisky + 1e-10); // Avoid log(0)
            } else {
                logLikelihood += Math.log(1 - pChooseRisky + 1e-10);
            }
        }

        return logLikelihood;
    }

    /**
     * Estimate participant's alpha using maximum likelihood
     * @returns {Object} { alpha, confidence, choices_analyzed }
     */
    estimateAlpha() {
        if (this.choices.length === 0) {
            console.warn('No valid choices to estimate alpha');
            return { alpha: 0.75, confidence: 0, choices_analyzed: 0 };
        }

        let bestAlpha = 0.75;
        let bestLikelihood = -Infinity;

        // Grid search over alpha values
        for (let alpha = this.alphaRange.min; alpha <= this.alphaRange.max; alpha += this.alphaRange.step) {
            const likelihood = this.calculateLogLikelihood(alpha);
            
            if (likelihood > bestLikelihood) {
                bestLikelihood = likelihood;
                bestAlpha = alpha;
            }
        }

        // Calculate confidence based on likelihood
        const confidence = this.calculateEstimationConfidence(bestAlpha, bestLikelihood);

        console.log(`Estimated alpha: ${bestAlpha.toFixed(3)} (confidence: ${confidence.toFixed(2)})`);
        console.log(`Analyzed ${this.choices.length} choices`);
        console.log(`Log-likelihood: ${bestLikelihood.toFixed(2)}`);

        return {
            alpha: bestAlpha,
            confidence: confidence,
            choices_analyzed: this.choices.length,
            log_likelihood: bestLikelihood
        };
    }

    /**
     * Calculate confidence in the alpha estimate
     * Based on how peaked the likelihood function is
     */
    calculateEstimationConfidence(bestAlpha, bestLikelihood) {
        // Calculate likelihood at alpha ± 0.1
        const lowerLikelihood = this.calculateLogLikelihood(Math.max(this.alphaRange.min, bestAlpha - 0.1));
        const upperLikelihood = this.calculateLogLikelihood(Math.min(this.alphaRange.max, bestAlpha + 0.1));

        // Higher difference = more peaked = higher confidence
        const peakedness = bestLikelihood - Math.max(lowerLikelihood, upperLikelihood);
        
        // Normalize to 0-100 scale
        const confidence = Math.min(100, Math.max(0, peakedness * 10));
        
        return confidence;
    }

    /**
     * Get summary statistics of participant's choices
     */
    getChoiceSummary() {
        if (this.choices.length === 0) {
            return null;
        }

        const riskyChoices = this.choices.filter(c => c.choseRisky).length;
        const safeChoices = this.choices.length - riskyChoices;
        const avgConfidence = this.choices.reduce((sum, c) => sum + (c.confidence || 50), 0) / this.choices.length;

        return {
            total_choices: this.choices.length,
            risky_choices: riskyChoices,
            safe_choices: safeChoices,
            percent_risky: (riskyChoices / this.choices.length * 100).toFixed(1),
            avg_confidence: avgConfidence.toFixed(1)
        };
    }

    /**
     * Reset estimator for new participant
     */
    reset() {
        this.choices = [];
    }
}

// Make available to experiment
if (typeof window !== 'undefined') {
    window.AlphaEstimator = AlphaEstimator;
}