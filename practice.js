// practice.js
// Practice trials for Risk Survey Task

function getPracticeTimeline(practiceCount) {
    const baseTrials = [
        {
            trial_number: 'practice_1',
            risk_probability: 75,
            risk_reward: 200,
            safe_reward: 150,
            size_condition: 'both-large',
            risk_on_left: true,
            blue_probability: 25
        },
        {
            trial_number: 'practice_2',
            risk_probability: 50,
            risk_reward: 150,
            safe_reward: 100,
            size_condition: 'both-small',
            risk_on_left: false,
            blue_probability: 50
        }
    ];

    const practiceTrials = [];
    for (let i = 0; i < practiceCount; i++) {
        const randomTrial = jsPsych.randomization.sampleWithReplacement(baseTrials, 1)[0];
        const trialData = { ...randomTrial, trial_number: `practice_${i + 1}` };
        practiceTrials.push(trialData);
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