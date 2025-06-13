// main_trials.js
// Main experiment trials for Risk Survey Task

function getMainTrialsTimeline(mainCount, trialDuration) {
    
    function generateTrialCombinations() {
        // This function can be complex and depends on the specific design.
        // For this example, we generate a simple set of combinations.
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

    function generateTrials() {
        const combinations = generateTrialCombinations();
        const trials = [];
        const sizeConditions = ['both-large', 'both-small', 'risk-large', 'safe-large'];
        const shuffledCombinations = jsPsych.randomization.shuffle(combinations).slice(0, mainCount);

        for (let i = 0; i < shuffledCombinations.length; i++) {
            const combo = shuffledCombinations[i];
            trials.push({
                trial_number: i + 1,
                risk_probability: combo.riskProbability,
                risk_reward: combo.riskReward,
                safe_reward: combo.safeReward,
                size_condition: jsPsych.randomization.sampleWithoutReplacement(sizeConditions, 1)[0],
                risk_on_left: Math.random() < 0.5,
            });
        }
        return trials;
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

    function createTrialHTML(trial) {
        const riskBarHTML = `
            <div class="risk-bar ${getSizeClass(trial.size_condition, 'risk')} selectable-bar" id="risk-bar" onclick="selectChoice('risk')">
                <div class="risk-bar-red" style="height: ${trial.risk_probability}%;">
                    ${trial.risk_probability}%
                </div>
                <div class="risk-bar-blue" style="height: ${100 - trial.risk_probability}%;">
                    ${100 - trial.risk_probability}%
                </div>
            </div>
            <div style="margin-top: 10px; font-weight: bold; font-size: 16px;">${trial.risk_reward}</div>`;

        const safeBarHTML = `
            <div class="safe-bar ${getSizeClass(trial.size_condition, 'safe')} selectable-bar" id="safe-bar" onclick="selectChoice('safe')">
                100%
            </div>
            <div style="margin-top: 10px; font-weight: bold; font-size: 16px;">${trial.safe_reward}</div>`;

        const leftOption = trial.risk_on_left ? riskBarHTML : safeBarHTML;
        const rightOption = trial.risk_on_left ? safeBarHTML : riskBarHTML;

        return `
            <div class="bars-area">
                <div class="option-container">${leftOption}</div>
                <div class="option-container">${rightOption}</div>
            </div>
            <div class="confidence-container">
                <div class="confidence-label">On a scale of 0–100, how confident are you in your choice?</div>
                <input type="range" class="confidence-slider" id="confidence-slider" min="0" max="100" value="50" oninput="updateConfidence(this.value)">
                <div class="confidence-value" id="confidence-value">50</div>
            </div>
            <div class="navigation">
                <button class="next-button" id="next-button" onclick="advanceTrial()" disabled>Next</button>
            </div>`;
    }

    const trials = generateTrials();
    const timeline = [];
    trials.forEach((trial) => {
        timeline.push({
            type: jsPsychHtmlButtonResponse,
            stimulus: createTrialHTML(trial),
            choices: [],
            data: {
                // Static data attached directly to the trial
                trial_number: trial.trial_number,
                condition: trial.size_condition,
                'Test Condition': trial.size_condition,
                'Risk Condition': `${trial.risk_probability};${100 - trial.risk_probability}`,
                'Risky Option Amount': trial.risk_reward,
                'Safe Option Amount': trial.safe_reward,
                'EV Condition': "Same" // Placeholder
            },
            on_load: function() {
                resetTrialState();
            },
            on_finish: function(data) {
                // Dynamic data is added here, when the trial finishes
                data.choice = window.currentChoice;
                data.confidence = window.currentConfidence;
                data.page_entry_time = window.pageEntryTime;
                data.bar_choice_time = window.barChoiceTime;
                data.page_submit_time = (Date.now() - window.trialStartTime) / 1000;
                
                // Save the data row
                addDataRow(data);
            }
        });
    });
    return timeline;
} 