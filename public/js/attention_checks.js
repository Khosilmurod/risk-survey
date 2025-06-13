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
                question_type: q.type
            }
        };

        switch (q.type) {
            case 'multi-choice':
                // Shuffle options and remove any stray '*' from options
                const shuffledOptions = q.options
                    .map(opt => opt.replace('*', ''))
                    .sort(() => Math.random() - 0.5);
                
                const multiChoiceHTML = `
                    <div class="attention-check-container">
                        <div class="attention-check-prompt">${q.prompt.replace('*', '')}</div>
                        <div class="attention-check-options">
                            ${shuffledOptions.map((option, index) => `
                                <label class="attention-check-option">
                                    <input type="radio" name="attention-choice" value="${option}" data-index="${index}">
                                    <span>${option}</span>
                                </label>
                            `).join('')}
                        </div>
                        <div class="attention-warning" style="color: red; font-weight: bold; margin-top: 10px; visibility: hidden;"></div>
                        <div class="navigation" style="margin-top: 20px;">
                            <button id="attention-next-btn" class="next-button" disabled>Next</button>
                        </div>
                    </div>
                `;

                trial = {
                    ...baseTrial,
                    type: jsPsychHtmlButtonResponse,
                    stimulus: multiChoiceHTML,
                    choices: [],
                    on_load: function() {
                        const nextBtn = document.getElementById('attention-next-btn');
                        const warning = document.querySelector('.attention-warning');
                        const radios = document.querySelectorAll('input[name="attention-choice"]');
                        
                        // Initially disable the button
                        nextBtn.disabled = true;
                        
                        // Add event listeners to radio buttons
                        radios.forEach(radio => {
                            radio.addEventListener('change', function() {
                                const selectedValue = this.value;
                                if (selectedValue === q.correct_answer) {
                                    nextBtn.disabled = false;
                                    warning.style.visibility = 'hidden';
                                    warning.textContent = '';
                                } else {
                                    nextBtn.disabled = true;
                                    warning.style.visibility = 'visible';
                                    warning.textContent = 'Are you paying attention? Please select the correct answer to continue.';
                                }
                            });
                        });
                        
                        // Add click handler to next button
                        nextBtn.addEventListener('click', function() {
                            const selectedRadio = document.querySelector('input[name="attention-choice"]:checked');
                            if (selectedRadio && selectedRadio.value === q.correct_answer) {
                                jsPsych.finishTrial();
                            }
                        });
                    }
                };
                break;
            case 'text':
                const textHTML = `
                    <div class="attention-check-container">
                        <div class="attention-check-prompt">${q.prompt}</div>
                        <div class="attention-check-input">
                            <input type="text" id="attention-text-input" placeholder="Type your answer here..." style="width: 100%; padding: 10px; font-size: 16px; border: 1px solid #ccc; border-radius: 4px;">
                        </div>
                        <div class="attention-warning" style="color: red; font-weight: bold; margin-top: 10px; visibility: hidden;"></div>
                        <div class="navigation" style="margin-top: 20px;">
                            <button id="attention-next-btn" class="next-button" disabled>Next</button>
                        </div>
                    </div>
                `;

                trial = {
                    ...baseTrial,
                    type: jsPsychHtmlButtonResponse,
                    stimulus: textHTML,
                    choices: [],
                    on_load: function() {
                        const nextBtn = document.getElementById('attention-next-btn');
                        const warning = document.querySelector('.attention-warning');
                        const textInput = document.getElementById('attention-text-input');
                        
                        // Initially disable the button
                        nextBtn.disabled = true;
                        
                        // Add event listener to text input
                        textInput.addEventListener('input', function() {
                            const userInput = this.value.trim().toLowerCase();
                            const correctAnswer = q.correct_answer.toLowerCase();
                            
                            if (userInput === correctAnswer) {
                                nextBtn.disabled = false;
                                warning.style.visibility = 'hidden';
                                warning.textContent = '';
                            } else {
                                nextBtn.disabled = true;
                                warning.style.visibility = 'visible';
                                warning.textContent = 'Are you paying attention? Please type the correct answer to continue.';
                            }
                        });
                        
                        // Add click handler to next button
                        nextBtn.addEventListener('click', function() {
                            const userInput = textInput.value.trim().toLowerCase();
                            const correctAnswer = q.correct_answer.toLowerCase();
                            
                            if (userInput === correctAnswer) {
                                jsPsych.finishTrial();
                            }
                        });
                    }
                };
                break;
            case 'likert':
                const likertHTML = `
                    <div class="attention-check-container">
                        <div class="attention-check-prompt">${q.prompt}</div>
                        <div class="attention-check-likert">
                            ${q.labels.map((label, index) => `
                                <label class="attention-check-option">
                                    <input type="radio" name="attention-likert" value="${index}" data-label="${label}">
                                    <span>${label}</span>
                                </label>
                            `).join('')}
                        </div>
                        <div class="attention-warning" style="color: red; font-weight: bold; margin-top: 10px; visibility: hidden;"></div>
                        <div class="navigation" style="margin-top: 20px;">
                            <button id="attention-next-btn" class="next-button" disabled>Next</button>
                        </div>
                    </div>
                `;

                trial = {
                    ...baseTrial,
                    type: jsPsychHtmlButtonResponse,
                    stimulus: likertHTML,
                    choices: [],
                    on_load: function() {
                        const nextBtn = document.getElementById('attention-next-btn');
                        const warning = document.querySelector('.attention-warning');
                        const radios = document.querySelectorAll('input[name="attention-likert"]');
                        
                        // Initially disable the button
                        nextBtn.disabled = true;
                        
                        // Add event listeners to radio buttons
                        radios.forEach(radio => {
                            radio.addEventListener('change', function() {
                                const selectedLabel = this.getAttribute('data-label');
                                if (selectedLabel === q.correct_answer) {
                                    nextBtn.disabled = false;
                                    warning.style.visibility = 'hidden';
                                    warning.textContent = '';
                                } else {
                                    nextBtn.disabled = true;
                                    warning.style.visibility = 'visible';
                                    warning.textContent = 'Are you paying attention? Please select the correct answer to continue.';
                                }
                            });
                        });
                        
                        // Add click handler to next button
                        nextBtn.addEventListener('click', function() {
                            const selectedRadio = document.querySelector('input[name="attention-likert"]:checked');
                            if (selectedRadio && selectedRadio.getAttribute('data-label') === q.correct_answer) {
                                jsPsych.finishTrial();
                            }
                        });
                    }
                };
                break;
        }
        attentionChecks.push(trial);
    });

    return attentionChecks;
} 