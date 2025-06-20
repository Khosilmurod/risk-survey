/**
 * TrialRunner.js - Trial Execution and User Interaction
 * Handles running individual trials, timers, user input, and attention checks
 */

// Add trial execution methods to the RiskSurveyExperiment class
Object.assign(RiskSurveyExperiment.prototype, {
    
    runNextTrial() {
        if (this.currentTrialIndex >= this.currentTimeline.length) {
            if (this.isPractice) {
                this.startMainTrials();
            } else {
                this.finishExperiment();
            }
            return;
        }

        const trial = this.currentTimeline[this.currentTrialIndex];
        
        if (trial.is_attention) {
            this.runAttentionCheck(trial);
        } else {
            this.runMainTrial(trial);
        }
    },

    runMainTrial(trial) {
        this.clearTimer();
        this.resetTrialState();

        const totalTrials = this.isPractice ? this.practiceTrials.length : this.trials.length;
        const trialHTML = this.createTrialHTML(trial, totalTrials);
        
        document.body.innerHTML = `<div class="main-container trial-container-page">${trialHTML}</div>`;

        // Start timer for main trials (not practice)
        if (!this.isPractice) {
            this.startTrialTimer();
        }
    },

    runAttentionCheck(question) {
         this.clearTimer();
         
         let stimulus;
         switch (question.type) {
             case 'multi-choice':
                 stimulus = `
                     <div class="attention-check-container">
                         <div class="attention-check-prompt">${question.prompt}</div>
                         <div class="attention-check-options">
                             ${question.options.map((option, index) => `
                                 <label class="attention-check-option">
                                     <input type="radio" name="attention-choice" value="${option}" data-index="${index}">
                                     <span>${option}</span>
                                 </label>
                             `).join('')}
                         </div>
                         <div class="attention-warning" id="attention-warning" style="color: red; font-weight: bold; margin-top: 10px; visibility: hidden;"></div>
                         <div class="navigation" style="margin-top: 20px;">
                             <button id="attention-next-btn" class="next-button" disabled>Next</button>
                         </div>
                     </div>
                 `;
                 break;
                 
             case 'text':
                 stimulus = `
                     <div class="attention-check-container">
                         <div class="attention-check-prompt">${question.prompt}</div>
                         <div class="attention-check-input">
                             <input type="text" id="attention-text-input" placeholder="Type your answer here..." style="width: 100%; padding: 10px; font-size: 16px; border: 1px solid #ccc; border-radius: 4px;">
                         </div>
                         <div class="attention-warning" id="attention-warning" style="color: red; font-weight: bold; margin-top: 10px; visibility: hidden;"></div>
                         <div class="navigation" style="margin-top: 20px;">
                             <button id="attention-next-btn" class="next-button" disabled>Next</button>
                         </div>
                     </div>
                 `;
                 break;
                 
             case 'likert':
                 stimulus = `
                     <div class="attention-check-container">
                         <div class="attention-check-prompt">${question.prompt}</div>
                         <div class="attention-check-likert">
                             ${question.labels.map((label, index) => `
                                 <label class="attention-check-option">
                                     <input type="radio" name="attention-likert" value="${index}" data-label="${label}">
                                     <span>${label}</span>
                                 </label>
                             `).join('')}
                         </div>
                         <div class="attention-warning" id="attention-warning" style="color: red; font-weight: bold; margin-top: 10px; visibility: hidden;"></div>
                         <div class="navigation" style="margin-top: 20px;">
                             <button id="attention-next-btn" class="next-button" disabled>Next</button>
                         </div>
                     </div>
                 `;
                 break;
         }

         document.body.innerHTML = `<div class="main-container attention-check-page">${stimulus}</div>`;
         this.setupAttentionCheckEvents(question);
    },

    setupAttentionCheckEvents(question) {
        const nextBtn = document.getElementById('attention-next-btn');
        const warning = document.getElementById('attention-warning');

        if (question.type === 'multi-choice') {
            const radios = document.querySelectorAll('input[name="attention-choice"]');
            
            radios.forEach(radio => {
                radio.addEventListener('change', () => {
                    if (radio.value === question.correct_answer) {
                        nextBtn.disabled = false;
                        warning.style.visibility = 'hidden';
                    } else {
                        nextBtn.disabled = true;
                        warning.style.visibility = 'visible';
                        warning.textContent = 'Are you paying attention? Please select the correct answer to continue.';
                    }
                });
            });
            
        } else if (question.type === 'text') {
            const textInput = document.getElementById('attention-text-input');
            
            textInput.addEventListener('input', () => {
                const userInput = textInput.value.trim().toLowerCase();
                const correctAnswer = question.correct_answer.toLowerCase();
                
                if (userInput === correctAnswer) {
                    nextBtn.disabled = false;
                    warning.style.visibility = 'hidden';
                } else {
                    nextBtn.disabled = true;
                    warning.style.visibility = 'visible';
                    warning.textContent = 'Are you paying attention? Please type the correct answer to continue.';
                }
            });
            
        } else if (question.type === 'likert') {
            const radios = document.querySelectorAll('input[name="attention-likert"]');
            
            radios.forEach(radio => {
                radio.addEventListener('change', () => {
                    const selectedLabel = radio.getAttribute('data-label');
                    if (selectedLabel === question.correct_answer) {
                        nextBtn.disabled = false;
                        warning.style.visibility = 'hidden';
                    } else {
                        nextBtn.disabled = true;
                        warning.style.visibility = 'visible';
                        warning.textContent = 'Are you paying attention? Please select the correct answer to continue.';
                    }
                });
            });
        }

        nextBtn.addEventListener('click', () => {
            if (!nextBtn.disabled) {
                this.currentTrialIndex++;
                this.runNextTrial();
            }
        });
    },

    createTrialHTML(trial, totalTrials) {
        const riskBarHTML = `
            <div class="option">
                <div class="option-label option-label-top">${trial.risk_reward}</div>
                <div class="risk-bar ${this.getSizeClass(trial.size_condition, 'risk')} selectable-bar" id="risk-bar" onclick="experiment.selectChoice('risk')">
                    <div class="risk-bar-red" style="height: ${trial.risk_probability}%;">
                        ${trial.risk_probability}%
                    </div>
                    <div class="risk-bar-blue" style="height: ${100 - trial.risk_probability}%;">
                        ${100 - trial.risk_probability}%
                    </div>
                </div>
                <div class="option-label option-label-bottom">0</div>
            </div>`;

        const safeBarHTML = `
            <div class="option">
                <div class="option-label option-label-top">${trial.safe_reward}</div>
                <div class="safe-bar ${this.getSizeClass(trial.size_condition, 'safe')} selectable-bar" id="safe-bar" onclick="experiment.selectChoice('safe')">
                    100%
                </div>
                <div class="option-label option-label-bottom" style="visibility: hidden;">0</div>
            </div>`;

        const leftOption = trial.risk_on_left ? riskBarHTML : safeBarHTML;
        const rightOption = trial.risk_on_left ? safeBarHTML : riskBarHTML;

        const trialCounterText = this.isPractice ? 
            `Practice ${trial.trial_number.replace('practice_', '')}` : 
            `Trial ${trial.trial_number} of ${totalTrials}`;

        return `
            <div class="trial-header">
                <div id="trial-counter">${trialCounterText}</div>
                <div id="trial-timer">${!this.isPractice ? 'Time left: 8s' : ''}</div>
            </div>
            <div class="bars-area">
                <div class="option-container">${leftOption}</div>
                <div class="option-container">${rightOption}</div>
            </div>
            <div class="confidence-container">
                <div class="confidence-label" id="confidence-label">On a scale of 0–100, how confident are you in your choice?</div>
                <input type="range" class="confidence-slider" id="confidence-slider" min="0" max="100" value="50" oninput="experiment.updateConfidence(this.value)" disabled>
                <div class="confidence-value" id="confidence-value">50</div>
            </div>
            <div class="navigation">
                <button class="next-button" id="next-button" onclick="experiment.advanceTrial()" disabled>Next</button>
            </div>`;
    },

    getSizeClass(sizeCondition, optionType) {
        switch (sizeCondition) {
            case 'both-large': return 'size-large';
            case 'both-small': return 'size-small';
            case 'risk-large': return optionType === 'risk' ? 'size-large' : 'size-small';
            case 'safe-large': return optionType === 'safe' ? 'size-large' : 'size-small';
            default: return 'size-large';
        }
    },

    resetTrialState() {
        this.currentChoice = null;
        this.currentConfidence = null;
        this.trialStartTime = Date.now();
        this.pageEntryTime = (Date.now() - this.trialStartTime) / 1000; // Set immediately when page loads
        this.barChoiceTime = null;
        this.sliderInteracted = false;
    },

    startTrialTimer() {
        let timeLeft = this.experimentConfig.trialDuration / 1000;
        const timerElement = document.getElementById('trial-timer');

        if (timerElement) {
            timerElement.textContent = `Time left: ${timeLeft}s`;
        }

        this.currentTimer = setInterval(() => {
            timeLeft--;
            if (timerElement) {
                timerElement.textContent = `Time left: ${timeLeft}s`;
            }
            if (timeLeft <= 0) {
                this.clearTimer();
                this.finishTrial();
            }
        }, 1000);
    },

    clearTimer() {
        if (this.currentTimer) {
            clearInterval(this.currentTimer);
            this.currentTimer = null;
        }
    },

    selectChoice(choice) {
        const time = (Date.now() - this.trialStartTime) / 1000;
        this.barChoiceTime = time; // Record when choice was made

        this.currentChoice = choice;
        document.querySelectorAll('.selectable-bar').forEach(bar => {
            bar.classList.remove('selected-bar');
        });
        const selectedElement = document.getElementById(choice === 'risk' ? 'risk-bar' : 'safe-bar');
        if (selectedElement) {
            selectedElement.classList.add('selected-bar');
        }
        
        // Enable the confidence slider after bar selection
        const confidenceSlider = document.getElementById('confidence-slider');
        const confidenceLabel = document.getElementById('confidence-label');
        if (confidenceSlider) {
            confidenceSlider.disabled = false;
        }
        if (confidenceLabel) {
            confidenceLabel.textContent = 'On a scale of 0–100, how confident are you in your choice?';
        }
        
        this.checkTrialComplete();
    },

    updateConfidence(value) {
        // Only allow updating if a choice has been made
        if (this.currentChoice === null) {
            return;
        }
        
        this.currentConfidence = parseInt(value);
        this.sliderInteracted = true;
        const confidenceValueElement = document.getElementById('confidence-value');
        if (confidenceValueElement) {
            confidenceValueElement.textContent = value;
        }
        this.checkTrialComplete();
    },

    checkTrialComplete() {
        const nextButton = document.getElementById('next-button');
        if (nextButton && this.currentChoice !== null && this.sliderInteracted) {
            nextButton.disabled = false;
        } else if (nextButton) {
            nextButton.disabled = true;
        }
    },

    advanceTrial() {
        this.finishTrial();
    },

    finishTrial() {
        this.clearTimer();
        
        if (!this.isPractice) {
            const trial = this.currentTimeline[this.currentTrialIndex];
            if (!trial.is_attention) {
                this.saveTrialData(trial);
            }
        }
        
        this.currentTrialIndex++;
        this.runNextTrial();
    }
}); 