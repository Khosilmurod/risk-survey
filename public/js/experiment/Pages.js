/**
 * Pages.js - UI Pages and Screens
 * Handles welcome page, instructions, transitions between experiment phases
 */

// Add UI page methods to the RiskSurveyExperiment class
Object.assign(RiskSurveyExperiment.prototype, {
    
    showWelcomePage() {
        document.body.innerHTML = `
            <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem;">
                <div style="text-align: center; max-width: 600px; width: 100%;">
                    <h1 style="font-size: 3rem; font-weight: 300; color: var(--text-primary); margin-bottom: 1rem; letter-spacing: -1px;">Decision-Making Study</h1>
                    <p style="font-size: 1.2rem; color: var(--text-secondary); margin-bottom: 4rem; font-weight: 300;">
                        Welcome! Thank you for participating in this research study.
                    </p>
                    
                    <div style="margin-bottom: 3rem;">
                        <h2 style="font-size: 1.5rem; font-weight: 500; color: var(--text-primary); margin-bottom: 2rem;">Please Enter Your Information</h2>
                        
                        <div style="margin-bottom: 1.5rem;">
                            <label for="subject-id" style="display: block; font-weight: 500; margin-bottom: 0.5rem; color: var(--text-primary); text-align: left;">Subject ID:</label>
                            <input type="text" id="subject-id" placeholder="Enter your subject ID..." 
                                style="width: 100%; padding: 16px 20px; font-size: 16px; border: 1px solid #e5e5e5; border-radius: 4px; box-sizing: border-box; font-family: inherit;">
                        </div>
                        
                        <div id="id-warning" style="color: var(--risk-red); font-weight: 500; margin-top: 10px; visibility: hidden;">
                            Please enter a valid subject ID to continue.
                        </div>
                    </div>
                    
                    <div style="text-align: center;">
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
    },

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
    },

    showInstructions() {
        document.body.innerHTML = `
            <div style="min-height: 100vh; padding: 3rem 2rem; max-width: 1200px; margin: 0 auto;">
                <div class="instructions" style="text-align: left; max-width: 900px; margin: 0 auto;">
                    <h1 style="font-size: 2.5rem; font-weight: 300; color: var(--text-primary); margin-bottom: 3rem; letter-spacing: -1px; text-align: center;">Instructions for the Decision-Making Task</h1>
                    
                    <p style="font-size: 1.2rem; color: var(--text-primary); margin-bottom: 2rem; line-height: 1.8; font-weight: 300;">
                        In this study, you will be making decisions between different monetary choices. These choices represent hypothetical situations, but you should choose as if the decisions were real.
                    </p>
                    
                    <div style="margin-bottom: 2rem;">
                        <h2 style="font-size: 1.6rem; font-weight: 400; color: var(--text-primary); margin-bottom: 2rem;">
                            1. <u>Understanding Monetary Choices</u>: On each screen, you will be presented with two options—one will be a lottery, and the other will be a guaranteed amount.
                        </h2>
                        
                        <div style="margin: 1.5rem 0;">
                            <p style="font-size: 1.1rem; color: var(--text-primary); margin-bottom: 1rem; line-height: 1.7; font-weight: 300;">
                                <strong>○ Option 1</strong>: A lottery has two possible outcomes. In the example below, the outcomes are 200 points or 0. The red and blue areas and the numbers within them represent the chance for obtaining these outcomes. There is a 75% chance of obtaining 200 points and a 25% chance of obtaining 0 points.
                            </p>
                            
                            <div style="text-align: center; margin: 2rem 0;">
                                <div class="option" style="margin: 1rem auto; display: inline-block;">
                                    <div class="option-label" style="font-size: ${this.experimentConfig.fontSizes.small}px;">200</div>
                                    <div class="risk-bar" style="width: ${this.experimentConfig.barSizes.small.width}px; height: ${this.experimentConfig.barSizes.small.height}px; font-size: ${this.experimentConfig.fontSizes.small}px;">
                                        <div class="risk-bar-red" style="height: 75%; font-size: ${this.experimentConfig.fontSizes.small}px;">75%</div>
                                        <div class="risk-bar-blue" style="height: 25%; font-size: ${this.experimentConfig.fontSizes.small}px;">25%</div>
                                    </div>
                                    <div class="option-label" style="font-size: ${this.experimentConfig.fontSizes.small}px;">0</div>
                                </div>
                            </div>
                        </div>
                        
                        <div style="margin: 1.5rem 0;">
                            <p style="font-size: 1.1rem; color: var(--text-primary); margin-bottom: 1rem; line-height: 1.7; font-weight: 300;">
                                <strong>○ Option 2</strong>: A guaranteed outcome where you have a 100% chance (shown in the black bar) to win a specific number of points, such as 150 points seen in this example.
                            </p>
                            
                            <div style="text-align: center; margin: 2rem 0;">
                                <div class="option" style="margin: 1rem auto; display: inline-block;">
                                    <div class="option-label" style="font-size: ${this.experimentConfig.fontSizes.small}px;">150</div>
                                    <div class="safe-bar" style="width: ${this.experimentConfig.barSizes.small.width}px; height: ${this.experimentConfig.barSizes.small.height}px; font-size: ${this.experimentConfig.fontSizes.small}px;">
                                        100%
                                    </div>
                                    <div class="option-label" style="visibility: hidden; font-size: ${this.experimentConfig.fontSizes.small}px;">0</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin: 2rem 0;">
                        <h2 style="font-size: 1.6rem; font-weight: 400; color: var(--text-primary); margin-bottom: 2rem;">
                            2. <u>Your Task</u>:
                        </h2>
                        <ol style="line-height: 1.8; font-size: 1.1rem; font-weight: 300; margin-left: 2rem;">
                            <li style="margin-bottom: 1rem;"><strong>Choose</strong> your preferred option by clicking on it</li>
                            <li style="margin-bottom: 1rem;"><strong>Rate your confidence</strong> (0-100) in your choice</li>
                            <li style="margin-bottom: 1rem;"><strong>Click Next</strong> to continue to the next choice</li>
                        </ol>
                        <p style="font-size: 1.1rem; color: var(--text-secondary); margin-top: 2rem; font-style: italic; font-weight: 300;">
                            Make decisions as if they were real. You'll start with practice trials.
                        </p>
                    </div>
                    
                    <div style="margin: 2rem 0; padding: 2rem; border-left: 4px solid #ffeaa7;">
                        <h2 style="margin-top: 0; color: var(--text-primary); font-size: 1.6rem; font-weight: 400;">⏱️ Important Timing Info</h2>
                        <p style="margin-bottom: 0; color: var(--text-primary); line-height: 1.7; font-size: 1.1rem; font-weight: 300;">
                            You have <strong>8 seconds</strong> to make each choice. After selecting, rate your confidence (0-100) and click Next.
                        </p>
                    </div>
                    
                    <div style="margin: 2rem 0; padding: 2rem; border-left: 4px solid #bee5eb;">
                        <h2 style="margin-top: 0; color: var(--text-primary); font-size: 1.6rem; font-weight: 400;">🎯 What to Expect</h2>
                        <ul style="margin-bottom: 0; color: var(--text-primary); line-height: 1.7; font-size: 1.1rem; font-weight: 300; margin-left: 2rem;">
                            <li style="margin-bottom: 1rem;"><strong>${this.config?.practiceTrials || 2} practice trials</strong> to get familiar</li>
                            <li style="margin-bottom: 1rem;"><strong>${this.config?.mainTrials || 120} main trials</strong> with different choices</li>
                            <li style="margin-bottom: 1rem;">Some <strong>attention checks</strong> during the task</li>
                        </ul>
                    </div>
                
                <div style="text-align: center; margin-top: 3rem;">
                    <button class="next-button" onclick="experiment.startPractice()">Start Practice</button>
                    </div>
                </div>
            </div>
        `;
    },

    startMainTrials() {
        document.body.innerHTML = `
            <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem;">
                <div style="text-align: center; max-width: 600px;">
                    <h2 style="color: var(--text-primary); margin-bottom: 2rem; font-size: 2.5rem; font-weight: 300;">🎉 Practice Complete!</h2>
                    <p style="font-size: 1.3rem; color: var(--text-secondary); margin-bottom: 3rem; line-height: 1.6; font-weight: 300;">
                        Great! You're now ready for the main experiment.
                    </p>
                    <div style="margin: 3rem 0; padding: 2rem; border-left: 4px solid #c3e6c3;">
                        <h3 style="margin-top: 0; color: var(--text-primary); font-size: 1.4rem;">📊 What's Next</h3>
                        <ul style="margin-bottom: 0; color: var(--text-primary); line-height: 1.6; text-align: left; font-size: 1.1rem;">
                            <li style="margin-bottom: 0.8rem;"><strong>${this.config?.mainTrials || 120} decision trials</strong> with varying risk levels</li>
                            <li style="margin-bottom: 0.8rem;"><strong>8-second timer</strong> for each choice</li>
                        </ul>
                    </div>
                    <p style="font-size: 1.1rem; color: var(--text-secondary); margin-bottom: 3rem; font-weight: 300;">
                        The screen will go fullscreen for the main experiment.
                    </p>
                    <div style="text-align: center;">
                        <button class="next-button" onclick="experiment.beginMainTrials()">Begin</button>
                    </div>
                </div>
            </div>
        `;
    }
}); 