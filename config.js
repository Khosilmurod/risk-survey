// config.js

// Global configuration object
window.EXPERIMENT_CONFIG = {
    practiceTrials: 1,
    mainTrials: 4,
    attentionChecks: 2,
    trialDuration: 8000
};

// Attention Check Questions
window.ATTENTION_CHECK_QUESTIONS = [
    {
        "type": "multi-choice",
        "prompt": "To ensure you are paying attention, please select the option 'Blue'.",
        "options": ["Red", "Green", "Blue", "Yellow"],
        "correct_answer": "Blue"
    },
    {
        "type": "text",
        "prompt": "To ensure you are paying attention, please type the word 'apple' into the box below.",
        "correct_answer": "apple"
    },
    {
        "type": "likert",
        "prompt": "For this question, please select 'Strongly Agree'.",
        "labels": ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
        "correct_answer": "Strongly Agree"
    }
]; 