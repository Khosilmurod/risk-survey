// Risk Survey Task - Vanilla JavaScript Implementation
// Complete control over timers and trial flow

class RiskSurveyExperiment {
    constructor() {
        this.currentTrialIndex = 0;
        this.trials = [];
        this.attentionChecks = [];
        this.csvData = [];
        this.trialCounter = 1;
        this.currentTimer = null;
        this.experimentConfig = null;
        this.attentionCheckQuestions = null;
        this.subjectId = null;

        // Trial state
        this.currentChoice = null;
        this.currentConfidence = 0;
        this.trialStartTime = null;
        this.pageEntryTime = null;
        this.barChoiceTime = null;
        this.sliderInteracted = false;
    }

    async init() {
        try {
            const response = await fetch('config.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const config = await response.json();
            this.experimentConfig = config.experimentConfig;
            this.attentionCheckQuestions = config.attentionCheckQuestions;
            
            this.injectBarSizeCSS();
            this.generateTrials();
            this.showWelcomePage();
        } catch (error) {
            console.error("Could not load experiment configuration:", error);
            this.showError("Could not load experiment configuration. Please contact the researcher.");
        }
    }

    injectBarSizeCSS() {
        // Remove any existing dynamic bar size styles
        const existingStyle = document.getElementById('dynamic-bar-sizes');
        if (existingStyle) {
            existingStyle.remove();
        }

        // Create new style element with configurable bar sizes
        const styleElement = document.createElement('style');
        styleElement.id = 'dynamic-bar-sizes';
        
        const largeWidth = this.experimentConfig.barSizes.large.width;
        const largeHeight = this.experimentConfig.barSizes.large.height;
        const smallWidth = this.experimentConfig.barSizes.small.width;
        const smallHeight = this.experimentConfig.barSizes.small.height;

        // Calculate font sizes based on bar width (make them larger and more readable)
        const largeFontSize = Math.max(14, Math.floor(largeWidth / 8));
        const smallFontSize = Math.max(12, Math.floor(smallWidth / 6));

        styleElement.textContent = `
            .size-large, .size-large.risk-bar, .size-large.safe-bar {
                width: ${largeWidth}px !important;
                height: ${largeHeight}px !important;
                font-size: ${largeFontSize}px !important;
            }
            
            .size-large .risk-bar-red, .size-large .risk-bar-blue {
                font-size: ${largeFontSize}px !important;
            }
            
            .size-small, .size-small.risk-bar, .size-small.safe-bar {
                width: ${smallWidth}px !important;
                height: ${smallHeight}px !important;
                font-size: ${smallFontSize}px !important;
            }
            
            .size-small .risk-bar-red, .size-small .risk-bar-blue {
                font-size: ${smallFontSize}px !important;
            }

            /* Mobile responsiveness for custom sizes */
            @media (max-width: 768px) {
                .size-large, .size-large.risk-bar, .size-large.safe-bar {
                    width: ${Math.max(60, largeWidth * 0.7)}px !important;
                    height: ${Math.max(120, largeHeight * 0.7)}px !important;
                    font-size: ${Math.max(8, largeFontSize * 0.8)}px !important;
                }
                
                .size-large .risk-bar-red, .size-large .risk-bar-blue {
                    font-size: ${Math.max(8, largeFontSize * 0.8)}px !important;
                }
                
                .size-small, .size-small.risk-bar, .size-small.safe-bar {
                    width: ${Math.max(50, smallWidth * 0.7)}px !important;
                    height: ${Math.max(80, smallHeight * 0.7)}px !important;
                    font-size: ${Math.max(7, smallFontSize * 0.8)}px !important;
                }
                
                .size-small .risk-bar-red, .size-small .risk-bar-blue {
                    font-size: ${Math.max(7, smallFontSize * 0.8)}px !important;
                }
            }

            @media (max-width: 480px) {
                .size-large, .size-large.risk-bar, .size-large.safe-bar {
                    width: ${Math.max(50, largeWidth * 0.6)}px !important;
                    height: ${Math.max(100, largeHeight * 0.6)}px !important;
                    font-size: ${Math.max(7, largeFontSize * 0.7)}px !important;
                }
                
                .size-large .risk-bar-red, .size-large .risk-bar-blue {
                    font-size: ${Math.max(7, largeFontSize * 0.7)}px !important;
                }
                
                .size-small, .size-small.risk-bar, .size-small.safe-bar {
                    width: ${Math.max(40, smallWidth * 0.6)}px !important;
                    height: ${Math.max(70, smallHeight * 0.6)}px !important;
                    font-size: ${Math.max(6, smallFontSize * 0.7)}px !important;
                }
                
                .size-small .risk-bar-red, .size-small .risk-bar-blue {
                    font-size: ${Math.max(6, smallFontSize * 0.7)}px !important;
                }
            }
        `;

        document.head.appendChild(styleElement);
        console.log(`Bar sizes configured - Large: ${largeWidth}x${largeHeight}px, Small: ${smallWidth}x${smallHeight}px`);
    }

    showError(message) {
        document.body.innerHTML = `
            <div class="main-container">
                <div class="instructions">
                    <h2>Error</h2>
                    <div style="border: 1px solid #e5e5e5; padding: 2rem; border-radius: 4px; margin: 2rem 0; background: #fafafa; color: red;">
                        <p>${message}</p>
                    </div>
                </div>
            </div>`;
    }

    showWelcomePage() {
        document.body.innerHTML = `
            <div class="main-container" style="display: flex; align-items: center; justify-content: center; min-height: 100vh;">
                <div style="text-align: center; max-width: 500px; margin: 0 auto; width: 100%;">
                    <h1 style="color: var(--text-primary); margin-bottom: 2rem;">Welcome to the Study</h1>
                    <p style="font-size: 18px; color: var(--text-secondary); margin-bottom: 3rem; line-height: 1.6;">
                        Thank you for participating in our decision-making research study.
                    </p>
                    
                    <div style="background: #f8f9fa; border-radius: 8px; padding: 2rem; margin: 2rem 0; border-left: 4px solid var(--text-primary);">
                        <h3 style="margin-top: 0; color: var(--text-primary); margin-bottom: 1.5rem;">Please Enter Your Information</h3>
                        
                        <div style="margin-bottom: 1.5rem;">
                            <label for="subject-id" style="display: block; font-weight: 500; margin-bottom: 0.5rem; color: var(--text-primary);">Subject ID:</label>
                            <input type="text" id="subject-id" placeholder="Enter your subject ID..." 
                                style="width: 100%; padding: 12px; font-size: 16px; border: 2px solid #ddd; border-radius: 6px; box-sizing: border-box;">
                        </div>
                        
                        <div id="id-warning" style="color: var(--risk-red); font-weight: bold; margin-top: 10px; visibility: hidden;">
                            Please enter a valid subject ID to continue.
                        </div>
                    </div>
                    
                    <div style="margin-top: 3rem;">
                        <button id="continue-btn" class="next-button" onclick="experiment.validateAndContinue()" disabled>Continue</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listener for subject ID input
        const subjectInput = document.getElementById('subject-id');
        const continueBtn = document.getElementById('continue-btn');
        const warning = document.getElementById('id-warning');
        
        subjectInput.addEventListener('input', () => {
            const value = subjectInput.value.trim();
            if (value.length > 0) {
                continueBtn.disabled = false;
                continueBtn.style.background = 'var(--text-primary)';
                continueBtn.style.cursor = 'pointer';
                warning.style.visibility = 'hidden';
            } else {
                continueBtn.disabled = true;
                continueBtn.style.background = 'var(--text-light)';
                continueBtn.style.cursor = 'not-allowed';
            }
        });
        
        // Allow Enter key to continue
        subjectInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !continueBtn.disabled) {
                this.validateAndContinue();
            }
        });
    }

    validateAndContinue() {
        const subjectInput = document.getElementById('subject-id');
        const warning = document.getElementById('id-warning');
        const subjectId = subjectInput.value.trim();
        
        if (subjectId.length === 0) {
            warning.style.visibility = 'visible';
            warning.textContent = 'Please enter a valid subject ID to continue.';
            return;
        }
        
        // Store the subject ID
        this.subjectId = subjectId;
        console.log(`Subject ID set to: ${this.subjectId}`);
        
        // Continue to instructions
        this.showInstructions();
    }

    showInstructions() {
        document.body.innerHTML = `
            <div class="main-container">
                                <div class="instructions" style="text-align: center;">
                    <h2>Decision-Making Task</h2>
                    <p style="font-size: 18px; color: var(--text-primary); margin-bottom: 2rem;">You will choose between <strong>risky</strong> and <strong>safe</strong> options to earn points.</p>
                    
                    <div style="display: flex; justify-content: space-around; align-items: flex-start; gap: 3rem; margin: 2rem 0; flex-wrap: wrap;">
                        
                        <div style="flex: 1; min-width: 300px; text-align: center;">
                            <h3 style="color: var(--risk-red); margin-bottom: 1rem;">🎲 Risky Option</h3>
                            <div class="option" style="margin: 1rem auto;">
                                <div class="option-label" style="font-size: 20px; font-weight: bold; color: var(--text-primary);">200</div>
                                <div class="risk-bar size-small instruction-bar">
                                    <div class="risk-bar-red" style="height: 75%;">75%</div>
                                    <div class="risk-bar-blue" style="height: 25%;">25%</div>
                                </div>
                                <div class="option-label" style="font-size: 20px; font-weight: bold; color: var(--text-primary);">0</div>
                            </div>
                            <p style="font-size: 14px; color: var(--text-secondary); margin-top: 1rem; line-height: 1.4;">
                                <strong>75% chance</strong> to win 200 points<br>
                                <strong>25% chance</strong> to win 0 points
                            </p>
                        </div>

                        <div style="flex: 1; min-width: 300px; text-align: center;">
                            <h3 style="color: var(--safe-gray); margin-bottom: 1rem;">🛡️ Safe Option</h3>
                            <div class="option" style="margin: 1rem auto;">
                                <div class="option-label" style="font-size: 20px; font-weight: bold; color: var(--text-primary);">150</div>
                                <div class="safe-bar size-small instruction-bar">
                                    100%
                                </div>
                                <div class="option-label" style="visibility: hidden;">0</div>
                            </div>
                            <p style="font-size: 14px; color: var(--text-secondary); margin-top: 1rem; line-height: 1.4;">
                                <strong>100% chance</strong> to win 150 points<br>
                                Guaranteed outcome
                            </p>
                        </div>
                        
                    </div>
                    
                    <div style="background: #f8f9fa; border-radius: 8px; padding: 1.5rem; margin: 2rem 0; border-left: 4px solid var(--text-primary);">
                        <h3 style="margin-bottom: 1rem; color: var(--text-primary);">📋 Your Task</h3>
                        <ol style="text-align: left; max-width: 600px; margin: 0 auto; line-height: 1.6;">
                            <li style="margin-bottom: 0.5rem;"><strong>Choose</strong> your preferred option by clicking on it</li>
                            <li style="margin-bottom: 0.5rem;"><strong>Rate your confidence</strong> (0-100) in your choice</li>
                            <li style="margin-bottom: 0.5rem;"><strong>Click Next</strong> to continue to the next choice</li>
                        </ol>
                        <p style="font-size: 14px; color: var(--text-secondary); margin-top: 1rem; font-style: italic;">
                            Make decisions as if they were real. You'll start with practice trials.
                        </p>
                    </div>
                    
                    <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 1.5rem; margin: 2rem 0;">
                        <h3 style="margin-top: 0; color: #856404;">⏱️ Important Timing Info</h3>
                        <p style="margin-bottom: 0; color: #856404; line-height: 1.5;">
                            You have <strong>8 seconds</strong> to make each choice. After selecting, rate your confidence (0-100) and click Next.
                        </p>
                    </div>
                    
                    <div style="background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 1.5rem; margin: 2rem 0;">
                        <h3 style="margin-top: 0; color: #0c5460;">🎯 What to Expect</h3>
                        <ul style="margin-bottom: 0; color: #0c5460; line-height: 1.5; text-align: left; max-width: 600px; margin-left: auto; margin-right: auto;">
                            <li><strong>5 practice trials</strong> to get familiar</li>
                            <li><strong>72 main trials</strong> with different choices</li>
                            <li>Some <strong>attention checks</strong> during the task</li>
                        </ul>
                    </div>
                
                <div style="text-align: center; margin-top: 2rem;">
                    <button class="next-button" onclick="experiment.startPractice()">Start</button>
                </div>
                </div>
            </div>
        `;
    }

    generateTrials() {
        // Generate trial combinations
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

        // Generate practice trials
        const sizeConditions = ['both-large', 'both-small', 'risk-large', 'safe-large'];
        const shuffledForPractice = this.shuffle([...combinations]).slice(0, this.experimentConfig.practiceTrials);
        
        this.practiceTrials = shuffledForPractice.map((combo, i) => ({
            trial_number: `practice_${i + 1}`,
            risk_probability: combo.riskProbability,
            risk_reward: combo.riskReward,
            safe_reward: combo.safeReward,
            size_condition: sizeConditions[Math.floor(Math.random() * sizeConditions.length)],
            risk_on_left: Math.random() < 0.5,
            is_practice: true
        }));

        // Generate main trials
        const shuffledForMain = this.shuffle([...combinations]).slice(0, this.experimentConfig.mainTrials);
        
        this.trials = shuffledForMain.map((combo, i) => ({
            trial_number: i + 1,
            risk_probability: combo.riskProbability,
            risk_reward: combo.riskReward,
            safe_reward: combo.safeReward,
            size_condition: sizeConditions[Math.floor(Math.random() * sizeConditions.length)],
            risk_on_left: Math.random() < 0.5,
            is_practice: false
        }));

                 // Select and intersperse attention checks (only if they exist and are requested)
         this.finalTimeline = [...this.trials];
         
         if (this.attentionCheckQuestions && 
             this.attentionCheckQuestions.length > 0 && 
             this.experimentConfig.attentionChecks > 0) {
             
             const selectedAttentionChecks = this.shuffle([...this.attentionCheckQuestions])
                 .slice(0, this.experimentConfig.attentionChecks);
             
             this.attentionChecks = selectedAttentionChecks.map(q => ({ ...q, is_attention: true }));
             
             if (this.attentionChecks.length > 0 && this.trials.length > 0) {
                 const interval = Math.floor(this.trials.length / (this.attentionChecks.length + 1));
                 let insertedCount = 0;
                 
                 for (let i = 0; i < this.attentionChecks.length; i++) {
                     const insertPosition = (i + 1) * interval + insertedCount;
                     if (insertPosition < this.finalTimeline.length) {
                         this.finalTimeline.splice(insertPosition, 0, this.attentionChecks[i]);
                         insertedCount++;
                     } else {
                         this.finalTimeline.push(this.attentionChecks[i]);
                     }
                 }
             }
         }
    }

    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    startPractice() {
        this.currentTrialIndex = 0;
        this.isPractice = true;
        this.currentTimeline = this.practiceTrials;
        this.runNextTrial();
    }

    startMainTrials() {
        document.body.innerHTML = `
            <div class="main-container">
                <div style="text-align: center; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: var(--text-primary); margin-bottom: 1.5rem;">🎉 Practice Complete!</h2>
                    <p style="font-size: 18px; color: var(--text-secondary); margin-bottom: 1.5rem; line-height: 1.6;">
                        Great! You're now ready for the main experiment.
                    </p>
                    <div style="background: #e8f5e8; border: 1px solid #c3e6c3; border-radius: 8px; padding: 1.5rem; margin: 2rem 0;">
                        <h3 style="margin-top: 0; color: #2d5a2d;">📊 What's Next</h3>
                        <ul style="margin-bottom: 0; color: #2d5a2d; line-height: 1.5; text-align: left;">
                            <li><strong>72 decision trials</strong> with varying risk levels</li>
                            <li><strong>8-second timer</strong> for each choice</li>
                        </ul>
                    </div>
                    <p style="font-size: 16px; color: var(--text-secondary); margin-bottom: 2rem;">
                        The screen will go fullscreen for the main experiment.
                    </p>
                    <div class="navigation">
                        <button class="next-button" onclick="experiment.beginMainTrials()">Begin</button>
                    </div>
                </div>
            </div>
        `;
    }

    beginMainTrials() {
        // Request fullscreen
                if (document.fullscreenElement === null) {
            document.documentElement.requestFullscreen().then(() => {
                this.currentTrialIndex = 0;
                this.isPractice = false;
                this.currentTimeline = this.finalTimeline;
                this.runNextTrial();
            });
        } else {
            this.currentTrialIndex = 0;
            this.isPractice = false;
            this.currentTimeline = this.finalTimeline;
            this.runNextTrial();
        }
    }

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
    }

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
    }

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
     }

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
    }

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
                <div class="confidence-label">On a scale of 0–100, how confident are you in your choice?</div>
                <input type="range" class="confidence-slider" id="confidence-slider" min="0" max="100" value="0" oninput="experiment.updateConfidence(this.value)">
                <div class="confidence-value" id="confidence-value">0</div>
            </div>
            <div class="navigation">
                <button class="next-button" id="next-button" onclick="experiment.advanceTrial()" disabled>Next</button>
            </div>`;
    }

    getSizeClass(sizeCondition, optionType) {
        switch (sizeCondition) {
            case 'both-large': return 'size-large';
            case 'both-small': return 'size-small';
            case 'risk-large': return optionType === 'risk' ? 'size-large' : 'size-small';
            case 'safe-large': return optionType === 'safe' ? 'size-large' : 'size-small';
            default: return 'size-large';
        }
    }

    resetTrialState() {
        this.currentChoice = null;
        this.currentConfidence = 0;
        this.trialStartTime = Date.now();
        this.pageEntryTime = null;
        this.barChoiceTime = null;
        this.sliderInteracted = false;
    }

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
    }

    clearTimer() {
        if (this.currentTimer) {
            clearInterval(this.currentTimer);
            this.currentTimer = null;
        }
    }

    selectChoice(choice) {
        const time = (Date.now() - this.trialStartTime) / 1000;
        if (this.pageEntryTime === null) {
            this.pageEntryTime = time;
        }
        this.barChoiceTime = time;

        this.currentChoice = choice;
        document.querySelectorAll('.selectable-bar').forEach(bar => {
            bar.classList.remove('selected-bar');
        });
        const selectedElement = document.getElementById(choice === 'risk' ? 'risk-bar' : 'safe-bar');
        if (selectedElement) {
            selectedElement.classList.add('selected-bar');
        }
        this.checkTrialComplete();
    }

    updateConfidence(value) {
        this.currentConfidence = parseInt(value);
        this.sliderInteracted = true;
        const confidenceValueElement = document.getElementById('confidence-value');
        if (confidenceValueElement) {
            confidenceValueElement.textContent = value;
        }
        this.checkTrialComplete();
    }

    checkTrialComplete() {
        const nextButton = document.getElementById('next-button');
        if (nextButton && this.currentChoice !== null && this.sliderInteracted) {
            nextButton.disabled = false;
        } else if (nextButton) {
            nextButton.disabled = true;
        }
    }

    advanceTrial() {
        this.finishTrial();
    }

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

    saveTrialData(trial) {
        const choiceResponse = this.currentChoice === null ? 'NA' : (this.currentChoice === 'risk' ? 1 : 2);
        const pageSubmitTime = (Date.now() - this.trialStartTime) / 1000;

        const row = [
            `"${this.subjectId || 'unknown'}"`,
            this.trialCounter++,
            `"${trial.size_condition}"`,
            `"${choiceResponse}"`,
            this.currentConfidence,
            this.pageEntryTime,
            this.barChoiceTime,
            pageSubmitTime,
            `"${trial.size_condition}"`,
            `"${trial.risk_probability};${100 - trial.risk_probability}"`,
            trial.risk_reward,
            trial.safe_reward,
            `"Same"`
        ].join(',') + '\n';
        
        this.csvData.push(row);
    }

    async finishExperiment() {
        document.body.innerHTML = `
            <div class="main-container">
                <div class="instructions">
                    <h2>Completing the experiment...</h2>
                    <p>Please wait while your data is being saved.</p>
                </div>
            </div>`;

        try {
            const response = await fetch('/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: this.csvData.join('') }),
            });

            if (response.ok) {
                document.body.innerHTML = `
                    <div class="main-container">
                        <div class="instructions">
                            <h2>Thank You</h2>
                            <div style="border: 1px solid #e5e5e5; padding: 2rem; border-radius: 4px; margin: 2rem 0; background: #fafafa;">
                                <p style="font-size: 18px; margin-bottom: 1rem;">You have successfully completed the risk survey task.</p>
                                <p style="color: green; font-weight: bold;">Your responses have been successfully saved.</p>
                            </div>
                            <p>You may now close this window.</p>
                        </div>
                    </div>`;
    } else {
                throw new Error('Save failed');
            }
        } catch (err) {
            console.error('Error saving data:', err);
            document.body.innerHTML = `
                <div class="main-container">
                    <div class="instructions">
                        <h2>Error</h2>
                        <div style="border: 1px solid #e5e5e5; padding: 2rem; border-radius: 4px; margin: 2rem 0; background: #fafafa; color: red;">
                            <p>There was an error saving your data. Please contact the researcher.</p>
                        </div>
                    </div>
                </div>`;
        }
    }
}

// Initialize experiment when page loads
const experiment = new RiskSurveyExperiment();
document.addEventListener('DOMContentLoaded', () => {
    experiment.init();
}); 