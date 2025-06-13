// trial_logic.js

// --- Global State ---
window.currentChoice = null;
window.currentConfidence = 50;
window.trialStartTime = null;
window.pageEntryTime = null;
window.barChoiceTime = null;
window.trialActive = false; // Guard to prevent double finish

// --- Functions attached to the window object to be globally accessible ---

// Called when a user clicks on a risk/safe bar
window.selectChoice = function(choice) {
    const time = (Date.now() - window.trialStartTime) / 1000;
    if (window.pageEntryTime === null) {
        window.pageEntryTime = time;
    }
    window.barChoiceTime = time;

    window.currentChoice = choice;
    document.querySelectorAll('.selectable-bar').forEach(bar => {
        bar.classList.remove('selected-bar');
    });
    const selectedElement = document.getElementById(choice === 'risk' ? 'risk-bar' : 'safe-bar');
    if (selectedElement) {
        selectedElement.classList.add('selected-bar');
    }
    window.checkTrialComplete();
};

// Called when the confidence slider value changes
window.updateConfidence = function(value) {
    window.currentConfidence = parseInt(value);
    const confidenceValueElement = document.getElementById('confidence-value');
    if (confidenceValueElement) {
        confidenceValueElement.textContent = value;
    }
    window.checkTrialComplete();
};

// Enables the 'Next' button if a choice has been made
window.checkTrialComplete = function() {
    const nextButton = document.getElementById('next-button');
    if (nextButton && window.currentChoice !== null) {
        nextButton.disabled = false;
    }
};

// Advances to the next trial
window.advanceTrial = function() {
    if (!window.trialActive) return;
    window.trialActive = false;
    jsPsych.finishTrial();
};

// Resets the state for a new trial
window.resetTrialState = function() {
    window.currentChoice = null;
    window.currentConfidence = 50;
    window.trialStartTime = Date.now();
    window.pageEntryTime = null;
    window.barChoiceTime = null;
    window.trialActive = true;
    const slider = document.getElementById('confidence-slider');
    if (slider) {
        slider.value = 50;
    }
    const confidenceValue = document.getElementById('confidence-value');
    if (confidenceValue) {
        confidenceValue.textContent = '50';
    }
    const nextButton = document.getElementById('next-button');
    if (nextButton) {
        nextButton.disabled = true;
    }
}; 