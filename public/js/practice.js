// practice.js
// Practice trials for Risk Survey Task

function getPracticeTimeline(practiceCount) {
    // Use the same trial generation logic as main_trials.js
    function generateTrialCombinations() {
        const combinations = [];
        const riskProbs = [25, 50, 75];
        const riskRewards = [100, 200, 300];
        const safeRewards = [50, 100, 150];

        for (let p of riskProbs) {
            for (let rr of riskRewards) {
                for (let sr of safeRewards) {
                    combinations.push({
                        riskProbability: p,
                        riskReward: rr,
                        safeReward: sr,
                    });
                }
            }
        }
        return combinations;
    }

    function getSizeClass(sizeCondition, optionType) {
        switch (sizeCondition) {
            case 'both-large': return 'size-large';
            case 'both-small': return 'size-small';
            case 'risk-large': return optionType === 'risk' ? 'size-large' : 'size-small';
            case 'safe-large': return optionType === 'safe' ? 'size-large' : 'size-small';
            default: return 'size-large';
        }
    }

    // Generate all possible trial combinations
    const combinations = generateTrialCombinations();
    const sizeConditions = ['both-large', 'both-small', 'risk-large', 'safe-large'];
    const shuffledCombinations = jsPsych.randomization.shuffle(combinations).slice(0, practiceCount);

    // Create practice trials with random size and side
    const practiceTrials = [];
    for (let i = 0; i < shuffledCombinations.length; i++) {
        const combo = shuffledCombinations[i];
        practiceTrials.push({
            trial_number: `practice_${i + 1}`,
            risk_probability: combo.riskProbability,
            risk_reward: combo.riskReward,
            safe_reward: combo.safeReward,
            size_condition: jsPsych.randomization.sampleWithoutReplacement(sizeConditions, 1)[0],
            risk_on_left: Math.random() < 0.5
        });
    }

    function createTrialHTML(trial) {
        const riskBarHTML = `
            <div style="margin-bottom: 10px; font-weight: bold; font-size: 16px;">${trial.risk_reward}</div>
            <div class="risk-bar ${getSizeClass(trial.size_condition, 'risk')} selectable-bar" id="risk-bar" onclick="selectChoice('risk')">
                <div class="risk-bar-red" style="height: ${trial.risk_probability}%;">
                    ${trial.risk_probability}%
                </div>
                <div class="risk-bar-blue" style="height: ${100 - trial.risk_probability}%;">
                    ${100 - trial.risk_probability}%
                </div>
            </div>`;

        const safeBarHTML = `
            <div style="margin-bottom: 10px; font-weight: bold; font-size: 16px;">${trial.safe_reward}</div>
            <div class="safe-bar ${getSizeClass(trial.size_condition, 'safe')} selectable-bar" id="safe-bar" onclick="selectChoice('safe')" style="display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 14px;">
                100%
            </div>`;

        const leftOption = trial.risk_on_left ? riskBarHTML : safeBarHTML;
        const rightOption = trial.risk_on_left ? safeBarHTML : riskBarHTML;

        return `
            <div class="bars-area">
                <div class="option-container">${leftOption}</div>
                <div class="option-container">${rightOption}</div>
            </div>
            <div class="confidence-container">
                <div class="confidence-label">On a scale of 0–100, how confident are you in your choice?</div>
                <input type="range" class="confidence-slider" id="confidence-slider" min="0" max="100" value="0" oninput="updateConfidence(this.value)">
                <div class="confidence-value" id="confidence-value">0</div>
            </div>
            <div class="navigation">
                <button class="next-button" id="next-button" onclick="advanceTrial()" disabled>Next Trial</button>
            </div>`;
    }

    const timeline = [];
    practiceTrials.forEach((trial) => {
        timeline.push({
            type: jsPsychHtmlButtonResponse,
            stimulus: createTrialHTML(trial),
            choices: [],
            data: { trial_number: trial.trial_number, trial_type: 'practice' },
            on_load: function() {
                resetTrialState();
            },
            on_finish: function(data) {
                data.choice = window.currentChoice;
                data.confidence = window.currentConfidence;
            }
        });
    });
    return timeline;
} 