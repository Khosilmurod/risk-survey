// config.js

// Global configuration object
window.EXPERIMENT_CONFIG = {
    practiceTrials: 2,
    mainTrials: 8,
    attentionChecks: 4,
    trialDuration: 8000
};

// Attention Check Questions
window.ATTENTION_CHECK_QUESTIONS = [
    // 1. Instructional manipulation check (Likert)
    {
        type: "likert",
        prompt: "To show you are paying attention, please select 'Strongly Agree' for this question.",
        labels: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
        correct_answer: "Strongly Agree"
    },
    // 2. Instructional manipulation check (Likert)
    {
        type: "likert",
        prompt: "This is an attention check. Please select 'Disagree' for this question.",
        labels: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
        correct_answer: "Disagree"
    },
    // 3. Multi-choice with explicit instruction
    {
        type: "multi-choice",
        prompt: "To ensure you are paying attention, please select the option 'Banana'.",
        options: ["Apple", "Banana", "Orange", "Grape"],
        correct_answer: "Banana"
    },
    // 4. Multi-choice with explicit instruction
    {
        type: "multi-choice",
        prompt: "For quality purposes, please select 'Green'.",
        options: ["Red", "Blue", "Green", "Yellow"],
        correct_answer: "Green"
    },
    // 5. Trick question
    {
        type: "multi-choice",
        prompt: "Which of the following is a fruit?",
        options: ["Cow", "Banana", "Chair", "Elephant"],
        correct_answer: "Banana"
    },
    // 6. Silly obvious question
    {
        type: "multi-choice",
        prompt: "What color is the sky on a clear day?",
        options: ["Blue", "Green", "Red", "Yellow"],
        correct_answer: "Blue"
    },
    // 7. Instructed response item (Likert)
    {
        type: "likert",
        prompt: "Please select 'Neutral' for this question to show you are paying attention.",
        labels: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
        correct_answer: "Neutral"
    },
    // 8. Instructed response item (Likert)
    {
        type: "likert",
        prompt: "To confirm you are reading carefully, select 'Strongly Disagree'.",
        labels: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
        correct_answer: "Strongly Disagree"
    },
    // 9. Text entry attention check
    {
        type: "text",
        prompt: "To show you are paying attention, please type the word 'orange' below.",
        correct_answer: "orange"
    },
    // 10. Text entry attention check
    {
        type: "text",
        prompt: "Please type the number 'seven' to show you are paying attention.",
        correct_answer: "seven"
    },
    // 11. Multi-choice with explicit instruction
    {
        type: "multi-choice",
        prompt: "For this question, please select 'Dog'.",
        options: ["Cat", "Dog", "Fish", "Bird"],
        correct_answer: "Dog"
    },
    // 12. Multi-choice with explicit instruction
    {
        type: "multi-choice",
        prompt: "To show you are paying attention, select 'Circle'.",
        options: ["Square", "Triangle", "Circle", "Rectangle"],
        correct_answer: "Circle"
    },
    // 13. Silly question
    {
        type: "multi-choice",
        prompt: "How many legs does a typical human have?",
        options: ["One", "Two", "Three", "Four"],
        correct_answer: "Two"
    },
    // 14. Obvious fact
    {
        type: "multi-choice",
        prompt: "Which planet do humans live on?",
        options: ["Mars", "Venus", "Earth", "Jupiter"],
        correct_answer: "Earth"
    },
    // 15. Instructional manipulation check (Likert)
    {
        type: "likert",
        prompt: "To show you are paying attention, please select 'Agree' for this question.",
        labels: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
        correct_answer: "Agree"
    },
    // 16. Instructed response item (Likert)
    {
        type: "likert",
        prompt: "Please select 'Strongly Agree' for this question.",
        labels: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
        correct_answer: "Strongly Agree"
    },
    // 17. Text entry attention check
    {
        type: "text",
        prompt: "Type the word 'attention' below to show you are paying attention.",
        correct_answer: "attention"
    },
    // 18. Multi-choice with explicit instruction
    {
        type: "multi-choice",
        prompt: "For this question, please select 'Yellow'.",
        options: ["Red", "Blue", "Green", "Yellow"],
        correct_answer: "Yellow"
    },
    // 19. Silly question
    {
        type: "multi-choice",
        prompt: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        correct_answer: "4"
    },
    // 20. Instructed response item (Likert)
    {
        type: "likert",
        prompt: "To show you are paying attention, please select 'Disagree' for this question.",
        labels: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
        correct_answer: "Disagree"
    }
]; 