// attention_checks.js

/**
 * Creates an array of attention check trials.
 * @param {Array} attentionCheckQuestions - An array of question objects for attention checks.
 * @returns {Array} An array of jsPsych trials for the attention checks.
 */
function getAttentionChecks(attentionCheckQuestions) {
    const attentionChecks = [];

    attentionCheckQuestions.forEach(q => {
        let trial;
        const baseTrial = {
            data: {
                trial_type: 'attention_check',
                correct_answer: q.correct_answer,
                question_type: q.type,
                questions: [q]
            },
            on_finish: function(data) {
                // Generic scoring for different question types
                let response;
                if (q.type === 'likert') {
                    // jsPsych returns 0-indexed response for likert, but labels are what matter
                    response = q.labels[data.response];
                } else if (q.type === 'text') {
                    // For text, response is in a nested object
                    response = data.response.Q0;
                } else { // multi-choice
                    response = data.response.Q0;
                }
                data.correct = jsPsych.pluginAPI.compareKeys(response, q.correct_answer);
            }
        };

        switch (q.type) {
            case 'multi-choice':
                trial = {
                    ...baseTrial,
                    type: jsPsychSurveyMultiChoice,
                    questions: [{
                        prompt: `<div class="attention-check-prompt">${q.prompt}</div>`,
                        options: q.options,
                        required: true
                    }],
                    button_label: 'Next'
                };
                break;
            case 'text':
                trial = {
                    ...baseTrial,
                    type: jsPsychSurveyText,
                    questions: [{
                        prompt: `<div class="attention-check-prompt">${q.prompt}</div>`,
                        required: true
                    }],
                    button_label: 'Next'
                };
                break;
            case 'likert':
                trial = {
                    ...baseTrial,
                    type: jsPsychSurveyLikert,
                    questions: [{
                        prompt: `<div class="attention-check-prompt">${q.prompt}</div>`,
                        labels: q.labels,
                        required: true
                    }],
                    button_label: 'Next'
                };
                break;
        }
        attentionChecks.push(trial);
    });

    return attentionChecks;
} 