/**
 * ComprehensionCheck.js - Task Comprehension Questions
 * Handles comprehension validation before practice trials
 */

Object.assign(RiskSurveyExperiment.prototype, {
    
    startComprehensionCheck() {
        this.comprehensionState = {
            currentQuestion: 0,
            failureCount: 0,
            startTime: Date.now(),
            responses: []
        };
        
        this.comprehensionQuestions = [
            {
                prompt: "For the option on the right, what is the maximum amount of points you can potentially earn?",
                correctAnswer: 150,
                explanation: "The correct response is 150 because the black bar indicates a 100% chance of winning 150 points."
            },
            {
                prompt: "For the option on the left, what is the maximum amount of points you can potentially earn?",
                correctAnswer: 200,
                explanation: "The correct response is 200. The left option shows 200 points at the top, which represents the maximum possible outcome."
            },
            {
                prompt: "For the option on the left, what is the minimum amount of points you can potentially earn?",
                correctAnswer: 0,
                explanation: "The correct response is 0. The left option shows 0 points at the bottom, representing the minimum possible outcome when you don't win."
            }
        ];
        
        this.showComprehensionQuestion();
    },
    
    showComprehensionQuestion() {
        const questionNum = this.comprehensionState.currentQuestion + 1;
        const question = this.comprehensionQuestions[this.comprehensionState.currentQuestion];
        
        document.body.innerHTML = `
            <div style="min-height: 100vh; padding: 3rem 2rem; max-width: 1200px; margin: 0 auto;">
                <div style="text-align: center; max-width: 800px; margin: 0 auto;">
                    <h1 style="font-size: 2rem; font-weight: 400; color: var(--text-primary); margin-bottom: 1rem;">Task Comprehension Check</h1>
                    <p style="font-size: 1.1rem; color: var(--text-secondary); margin-bottom: 3rem;">
                        Question ${questionNum} of 3: Please answer the following question about the chart below.
                    </p>
                    
                    <!-- Chart Display -->
                    <div style="display: flex; justify-content: center; align-items: center; gap: 4rem; margin: 3rem 0;">
                        <!-- Left Option (Risky) -->
                        <div class="option" style="text-align: center;">
                            <div class="option-label" style="font-size: 24px; margin-bottom: 0.5rem; font-weight: bold;">200</div>
                            <div class="risk-bar" style="width: ${this.experimentConfig.barSizes.large.width}px; height: ${this.experimentConfig.barSizes.large.height}px; border: 2px solid #333; position: relative; background: #fff;">
                                <div class="risk-bar-red" style="height: 75%; background: #e74c3c; display: flex; align-items: center; justify-content: center; font-size: ${this.experimentConfig.fontSizes.large}px; color: white; font-weight: 600;">75</div>
                                <div class="risk-bar-blue" style="height: 25%; background: #3498db; display: flex; align-items: center; justify-content: center; font-size: ${this.experimentConfig.fontSizes.large}px; color: white; font-weight: 600;">25</div>
                            </div>
                            <div class="option-label" style="font-size: 24px; margin-top: 0.5rem; font-weight: bold;">0</div>
                        </div>
                        
                        <!-- Right Option (Safe) -->
                        <div class="option" style="text-align: center;">
                            <div class="option-label" style="font-size: 24px; margin-bottom: 0.5rem; font-weight: bold;">150</div>
                            <div class="safe-bar" style="width: ${this.experimentConfig.barSizes.large.width}px; height: ${this.experimentConfig.barSizes.large.height}px; background: #2c3e50; border: 2px solid #333; display: flex; align-items: center; justify-content: center; font-size: ${this.experimentConfig.fontSizes.large}px; color: white; font-weight: 600;">100</div>
                            <div class="option-label" style="visibility: hidden; font-size: 24px; margin-top: 0.5rem;">0</div>
                        </div>
                    </div>
                    
                    <!-- Question -->
                    <div style="margin: 3rem 0; padding: 2rem; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #3498db;">
                        <p style="font-size: 1.3rem; font-weight: 600; color: var(--text-primary); margin-bottom: 1.5rem;">
                            ${question.prompt}
                        </p>
                        
                        <div style="display: flex; align-items: center; justify-content: center; gap: 1rem;">
                            <label style="font-size: 1.1rem; font-weight: 500;">Your answer:</label>
                            <input type="number" id="comprehension-answer" placeholder="Enter number..." 
                                style="padding: 12px 16px; font-size: 18px; border: 2px solid #e5e5e5; border-radius: 6px; width: 180px; text-align: center; font-weight: 600;"
                                min="0" max="1000">
                        </div>
                        
                        <div id="error-message" style="color: #e74c3c; font-weight: 500; margin-top: 1rem; visibility: hidden;">
                            Please enter a valid number.
                        </div>
                    </div>
                    
                    <button onclick="experiment.submitComprehensionAnswer()" class="next-button" id="submit-answer">
                        Submit Answer
                    </button>
                </div>
            </div>
        `;
        
        // Focus on input and allow Enter to submit
        const input = document.getElementById('comprehension-answer');
        input.focus();
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitComprehensionAnswer();
            }
        });
        
        // Clear error on input
        input.addEventListener('input', () => {
            document.getElementById('error-message').style.visibility = 'hidden';
        });
    },
    
    submitComprehensionAnswer() {
        const input = document.getElementById('comprehension-answer');
        const errorMsg = document.getElementById('error-message');
        const answer = parseInt(input.value);
        
        // Validate input
        if (isNaN(answer) || input.value.trim() === '') {
            errorMsg.textContent = 'Please enter a valid number.';
            errorMsg.style.visibility = 'visible';
            input.focus();
            return;
        }
        
        const question = this.comprehensionQuestions[this.comprehensionState.currentQuestion];
        const isCorrect = answer === question.correctAnswer;
        const responseTime = Date.now() - this.comprehensionState.startTime;
        
        // Store response
        this.comprehensionState.responses.push({
            questionNumber: this.comprehensionState.currentQuestion + 1,
            userAnswer: answer,
            correctAnswer: question.correctAnswer,
            isCorrect: isCorrect,
            responseTime: responseTime
        });
        
        if (isCorrect) {
            this.showCorrectFeedback();
        } else {
            this.comprehensionState.failureCount++;
            this.showIncorrectFeedback();
        }
    },
    
    showCorrectFeedback() {
        const questionNum = this.comprehensionState.currentQuestion + 1;
        const question = this.comprehensionQuestions[this.comprehensionState.currentQuestion];
        
        document.body.innerHTML = `
            <div style="min-height: 100vh; padding: 3rem 2rem; max-width: 1200px; margin: 0 auto;">
                <div style="text-align: center; max-width: 800px; margin: 0 auto;">
                    <div style="margin-bottom: 2rem; padding: 1.5rem; background: #d4edda; border: 2px solid #c3e6c3; border-radius: 8px;">
                        <h2 style="color: #155724; margin: 0; font-size: 1.5rem;">✓ Correct!</h2>
                    </div>
                    
                    <p style="font-size: 1.2rem; color: var(--text-primary); margin-bottom: 2rem;">
                        Yes, the correct response is ${question.correctAnswer}!
                    </p>
                    
                    <!-- Highlighted Chart -->
                    <div style="display: flex; justify-content: center; align-items: center; gap: 4rem; margin: 3rem 0; padding: 2rem; background: #f0f8f0; border-radius: 8px; border: 2px solid #c3e6c3;">
                        <!-- Left Option -->
                        <div class="option" style="text-align: center;">
                            <div class="option-label" style="font-size: ${this.experimentConfig.fontSizes.small}px; margin-bottom: 0.5rem; font-weight: 600; ${this.shouldHighlightLeft() ? 'background: #ffeaa7; padding: 4px 8px; border-radius: 4px;' : ''}">200</div>
                            <div class="risk-bar" style="width: ${this.experimentConfig.barSizes.large.width}px; height: ${this.experimentConfig.barSizes.large.height}px; border: 2px solid #333; position: relative; background: #fff;">
                                <div class="risk-bar-red" style="height: 75%; background: #e74c3c; display: flex; align-items: center; justify-content: center; font-size: ${this.experimentConfig.fontSizes.large}px; color: white; font-weight: 600;">75</div>
                                <div class="risk-bar-blue" style="height: 25%; background: #3498db; display: flex; align-items: center; justify-content: center; font-size: ${this.experimentConfig.fontSizes.large}px; color: white; font-weight: 600;">25</div>
                            </div>
                            <div class="option-label" style="font-size: ${this.experimentConfig.fontSizes.small}px; margin-top: 0.5rem; font-weight: 600; ${this.shouldHighlightLeftBottom() ? 'background: #ffeaa7; padding: 4px 8px; border-radius: 4px;' : ''}">0</div>
                        </div>
                        
                        <!-- Right Option -->
                        <div class="option" style="text-align: center;">
                            <div class="option-label" style="font-size: ${this.experimentConfig.fontSizes.small}px; margin-bottom: 0.5rem; font-weight: 600; ${this.shouldHighlightRight() ? 'background: #ffeaa7; padding: 4px 8px; border-radius: 4px;' : ''}">150</div>
                            <div class="safe-bar" style="width: ${this.experimentConfig.barSizes.large.width}px; height: ${this.experimentConfig.barSizes.large.height}px; background: #2c3e50; border: 2px solid #333; display: flex; align-items: center; justify-content: center; font-size: ${this.experimentConfig.fontSizes.large}px; color: white; font-weight: 600;">100</div>
                            <div class="option-label" style="visibility: hidden; font-size: ${this.experimentConfig.fontSizes.small}px; margin-top: 0.5rem;">0</div>
                        </div>
                    </div>
                    
                    <button onclick="experiment.nextComprehensionQuestion()" class="next-button">
                        Continue
                    </button>
                </div>
            </div>
        `;
    },
    
    showIncorrectFeedback() {
        const question = this.comprehensionQuestions[this.comprehensionState.currentQuestion];
        
        document.body.innerHTML = `
            <div style="min-height: 100vh; padding: 3rem 2rem; max-width: 1200px; margin: 0 auto;">
                <div style="text-align: center; max-width: 800px; margin: 0 auto;">
                    <div style="margin-bottom: 2rem; padding: 1.5rem; background: #f8d7da; border: 2px solid #f5c6cb; border-radius: 8px;">
                        <h2 style="color: #721c24; margin: 0; font-size: 1.5rem;">Incorrect</h2>
                    </div>
                    
                    <p style="font-size: 1.2rem; color: var(--text-primary); margin-bottom: 2rem;">
                        ${question.explanation}
                    </p>
                    
                    <!-- Chart with Explanation -->
                    <div style="display: flex; justify-content: center; align-items: center; gap: 4rem; margin: 3rem 0; padding: 2rem; background: #fff3cd; border-radius: 8px; border: 2px solid #ffeaa7;">
                        <!-- Left Option -->
                        <div class="option" style="text-align: center;">
                            <div class="option-label" style="font-size: ${this.experimentConfig.fontSizes.small}px; margin-bottom: 0.5rem; font-weight: 600; ${this.shouldHighlightLeft() ? 'background: #ffeaa7; padding: 4px 8px; border-radius: 4px;' : ''}">200</div>
                            <div class="risk-bar" style="width: ${this.experimentConfig.barSizes.large.width}px; height: ${this.experimentConfig.barSizes.large.height}px; border: 2px solid #333; position: relative; background: #fff;">
                                <div class="risk-bar-red" style="height: 75%; background: #e74c3c; display: flex; align-items: center; justify-content: center; font-size: ${this.experimentConfig.fontSizes.large}px; color: white; font-weight: 600;">75</div>
                                <div class="risk-bar-blue" style="height: 25%; background: #3498db; display: flex; align-items: center; justify-content: center; font-size: ${this.experimentConfig.fontSizes.large}px; color: white; font-weight: 600;">25</div>
                            </div>
                            <div class="option-label" style="font-size: ${this.experimentConfig.fontSizes.small}px; margin-top: 0.5rem; font-weight: 600; ${this.shouldHighlightLeftBottom() ? 'background: #ffeaa7; padding: 4px 8px; border-radius: 4px;' : ''}">0</div>
                        </div>
                        
                        <!-- Right Option -->
                        <div class="option" style="text-align: center;">
                            <div class="option-label" style="font-size: ${this.experimentConfig.fontSizes.small}px; margin-bottom: 0.5rem; font-weight: 600; ${this.shouldHighlightRight() ? 'background: #ffeaa7; padding: 4px 8px; border-radius: 4px;' : ''}">150</div>
                            <div class="safe-bar" style="width: ${this.experimentConfig.barSizes.large.width}px; height: ${this.experimentConfig.barSizes.large.height}px; background: #2c3e50; border: 2px solid #333; display: flex; align-items: center; justify-content: center; font-size: ${this.experimentConfig.fontSizes.large}px; color: white; font-weight: 600;">100</div>
                            <div class="option-label" style="visibility: hidden; font-size: ${this.experimentConfig.fontSizes.small}px; margin-top: 0.5rem;">0</div>
                        </div>
                    </div>
                    
                    <div style="margin: 2rem 0; padding: 1.5rem; background: #f8f9fa; border-radius: 8px;">
                        <p style="font-size: 1.2rem; font-weight: 600; margin-bottom: 1rem;">Do you understand the explanation?</p>
                        <div style="display: flex; gap: 2rem; justify-content: center;">
                            <button onclick="experiment.handleUnderstandingResponse(true)" class="next-button" style="background: #28a745;">
                                Yes
                            </button>
                            <button onclick="experiment.handleUnderstandingResponse(false)" class="next-button" style="background: #dc3545;">
                                No
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    shouldHighlightLeft() {
        const qNum = this.comprehensionState.currentQuestion;
        return qNum === 1 || qNum === 2; // Questions 2 and 3 ask about left option
    },
    
    shouldHighlightRight() {
        const qNum = this.comprehensionState.currentQuestion;
        return qNum === 0; // Question 1 asks about right option
    },
    
    shouldHighlightLeftBottom() {
        const qNum = this.comprehensionState.currentQuestion;
        return qNum === 2; // Question 3 asks about minimum (0) of left option
    },
    
    handleUnderstandingResponse(understood) {
        // Continue regardless of yes/no response as per requirements
        this.nextComprehensionQuestion();
    },
    
    nextComprehensionQuestion() {
        this.comprehensionState.currentQuestion++;
        
        // Check if we've completed all 3 questions
        if (this.comprehensionState.currentQuestion >= 3) {
            // Check failure condition - if failed 3 questions total, end survey
            if (this.comprehensionState.failureCount >= 3) {
                this.showComprehensionFailure();
                return;
            }
            
            // Passed comprehension, log results and continue to practice
            this.logComprehensionResults();
            this.startPractice();
            return;
        }
        
        // Reset start time for next question
        this.comprehensionState.startTime = Date.now();
        this.showComprehensionQuestion();
    },
    
    showComprehensionFailure() {
        document.body.innerHTML = `
            <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem;">
                <div style="text-align: center; max-width: 600px; padding: 3rem; background: #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <h2 style="color: #dc3545; margin-bottom: 2rem; font-size: 2rem;">Study Complete</h2>
                    <div style="margin: 2rem 0; padding: 2rem; background: #f8d7da; border-radius: 8px; border-left: 4px solid #dc3545;">
                        <p style="font-size: 1.2rem; color: #721c24; margin: 0;">
                            Thank you for your time. Unfortunately, you are not eligible to continue with this study at this time.
                        </p>
                    </div>
                    <p style="font-size: 1rem; color: #666; margin-top: 2rem;">
                        You may now close this window.
                    </p>
                </div>
            </div>
        `;
    },
    
    logComprehensionResults() {
        // Optional: Log to console or send to server for research tracking
        console.log('Comprehension check completed:', {
            participantId: this.subjectId,
            responses: this.comprehensionState.responses,
            totalFailures: this.comprehensionState.failureCount,
            passed: this.comprehensionState.failureCount < 3
        });
        
        // Could add server logging here if needed for research purposes
        // this.sendComprehensionData(this.comprehensionState);
    }
});