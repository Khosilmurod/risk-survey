/**
 * DataCollector.js - Data Collection and Export
 * Handles saving trial data, CSV generation, and finishing the experiment
 */

// Add data collection methods to the RiskSurveyExperiment class
Object.assign(RiskSurveyExperiment.prototype, {
    
    saveTrialData(trial) {
        const submitTime = (Date.now() - this.trialStartTime) / 1000;
        
        // Ensure choice is a proper string value
        let choiceValue = 'timeout'; // Default if no choice made
        if (this.currentChoice === 'risk' || this.currentChoice === 'safe') {
            choiceValue = this.currentChoice;
        }
        
        // Set confidence to NaN if slider wasn't interacted with
        let confidenceValue = this.sliderInteracted && this.currentConfidence !== null ? this.currentConfidence : NaN;
        
        // Calculate intuitive timing metrics
        const bar_choice_time = this.barChoiceTime || NaN; // Time from page load to bar choice
        const confidence_choice_time = (this.barChoiceTime && submitTime) ? (submitTime - this.barChoiceTime) : NaN; // Time from bar choice to confidence
        
        // Determine positions
        const riskPosition = trial.risk_on_left ? 'left' : 'right';
        const safePosition = trial.risk_on_left ? 'right' : 'left';
        
        // Calculate expected value comparison
        const riskEV = (trial.risk_probability / 100) * trial.risk_reward;
        const safeEV = trial.safe_reward;
        let ev;
        if (Math.abs(riskEV - safeEV) < 0.01) { // essentially equal
            ev = 'same';
        } else if (safeEV > riskEV) {
            ev = 'safe';
        } else {
            ev = 'risky';
        }
        
        // Create clean CSV row with intuitive field names
        const row = [
            this.subjectId || 'unknown',           // participant_id
            this.trialCounter++,                   // trial_number  
            trial.size_condition || 'unknown',    // bar_size_condition
            choiceValue,                           // choice (risk/safe/timeout)
            confidenceValue,                       // confidence (0-100 or NaN)
            trial.risk_probability || 0,          // risk_probability
            trial.risk_reward || 0,               // risk_reward  
            100,                                   // safe_probability (always 100%)
            trial.safe_reward || 0,               // safe_reward
            riskPosition,                          // risk_position (left/right)
            safePosition,                          // safe_position (left/right)
            ev,                                    // ev (same/safe/risky)
            bar_choice_time,                       // bar_choice_time (seconds from page load to bar choice)
            confidence_choice_time,                // confidence_choice_time (seconds from bar choice to confidence)
            trial.trial_id || 'unknown'           // trial_id
        ];
        
        // Properly escape CSV fields
        const escapedRow = row.map(field => {
            const str = String(field);
            // If field contains comma, newline, or quote, wrap in quotes and escape internal quotes
            if (str.includes(',') || str.includes('\n') || str.includes('"')) {
                return '"' + str.replace(/"/g, '""') + '"';
            }
            return str;
        }).join(',') + '\n';
        
        this.csvData.push(escapedRow);
        
        // Debug logging with clearer format
        console.log(`Trial ${this.trialCounter - 1}: choice="${choiceValue}", confidence=${confidenceValue}, ev=${ev}, bar_choice_time=${bar_choice_time}s, confidence_time=${confidence_choice_time}s`);
    },

    saveAttentionCheckData(question, userAnswer, isCorrect, responseTime) {
        const attentionCheckRow = {
            participant_id: this.subjectId || 'unknown',
            attention_check_number: this.attentionCheckData.length + 1,
            question_type: question.type,
            question_prompt: question.prompt,
            correct_answer: question.correct_answer,
            user_answer: userAnswer,
            is_correct: isCorrect,
            response_time: responseTime,
            timestamp: new Date().toISOString(),
            session_id: this.sessionId
        };
        
        this.attentionCheckData.push(attentionCheckRow);
        console.log(`Attention Check ${this.attentionCheckData.length}: ${isCorrect ? 'CORRECT' : 'INCORRECT'} - "${userAnswer}"`);
    },

    async finishExperiment() {
        // Check if this is end of Phase 1
        if (this.currentPhase === 1) {
            console.log('Phase 1 complete - transitioning to Phase 2');
            await this.transitionToPhase2();
            return; // Don't save yet!
        }
        
        // Phase 2 complete - now save all data
        if (!this.csvData || this.csvData.length === 0) {
            console.error('No data to save!');
            this.showDataError('No trial data was collected. Please contact the researcher.');
            return;
        }

        if (!this.subjectId) {
            console.error('No subject ID!');
            this.showDataError('Subject ID is missing. Please contact the researcher.');
            return;
        }

        document.body.innerHTML = `
            <div class="main-container">
                <div class="instructions">
                    <h2>Completing the experiment...</h2>
                    <p>Please wait while your data is being saved.</p>
                    <div style="margin-top: 1rem; color: #666;">
                        <small>Saving ${this.csvData.length} trial records for subject ${this.subjectId}...</small>
                    </div>
                </div>
            </div>`;

        try {
            console.log(`Attempting to save ${this.csvData.length} trials for subject ${this.subjectId}`);
            console.log('Sample data row:', this.csvData[0]);

            // Save main trial data
            const trialResponse = await fetch('/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: this.csvData.join('') }),
            });

            // Save attention check data
            const attentionResponse = await fetch('/save-attention', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    participantId: this.subjectId,
                    data: this.attentionCheckData 
                }),
            });

            console.log('Trial data response:', await trialResponse.text());
            console.log('Attention check response:', await attentionResponse.text());

            if (trialResponse.ok && attentionResponse.ok) {
                this.showDownloadPage();
            } else {
                throw new Error(`Server error saving data`);
            }
        } catch (err) {
            console.error('Error saving data:', err);
            this.showDataError(`There was an error saving your data: ${err.message}`);
        }
    },

    showDownloadPage() {
        document.body.innerHTML = `
            <div class="main-container">
                <div class="instructions">
                    <h2>Thank You!</h2>
                    <div style="border: 1px solid #e5e5e5; padding: 2rem; border-radius: 4px; margin: 2rem 0; background: #fafafa;">
                        <p style="font-size: 18px; margin-bottom: 1rem;">You have successfully completed the risk survey task.</p>
                        <p style="color: green; font-weight: bold; margin-bottom: 2rem;">Your responses have been successfully saved.</p>
                        
                        <div style="margin-top: 1rem; color: #666; font-size: 14px;">
                            <small>Subject ID: ${this.subjectId} | Trials completed: ${this.csvData.length} | Attention checks: ${this.attentionCheckData.length}</small>
                        </div>
                    </div>
                    <p>You may now close this window.</p>
                </div>
            </div>`;
    },

    showDataError(message) {
        document.body.innerHTML = `
            <div class="main-container">
                <div class="instructions">
                    <h2>Data Save Error</h2>
                    <div style="border: 1px solid #e5e5e5; padding: 2rem; border-radius: 4px; margin: 2rem 0; background: #fff2f2; color: #d32f2f; border-left: 4px solid #d32f2f;">
                        <p style="font-weight: bold; margin-bottom: 1rem;">⚠️ Unable to save your data</p>
                        <p>${message}</p>
                        <div style="margin-top: 1.5rem; padding: 1rem; background: #f5f5f5; border-radius: 4px;">
                            <p style="font-weight: bold; margin-bottom: 0.5rem;">Debug Information:</p>
                            <p style="font-size: 12px; font-family: monospace; margin: 0;">
                                Subject ID: ${this.subjectId || 'MISSING'}<br>
                                Trials collected: ${this.csvData?.length || 0}<br>
                                Timestamp: ${new Date().toISOString()}
                            </p>
                        </div>
                    </div>
                    <p>Please screenshot this message and contact the researcher immediately.</p>
                </div>
            </div>`;
    },

    async transitionToPhase2() {
        // Initialize alpha estimator
        this.alphaEstimator = new AlphaEstimator();
        
        // Skip header row and parse Phase 1 data
        const dataRows = this.csvData.slice(1); // Skip header
        
        dataRows.forEach(rowString => {
            const values = this.parseCSVRow(rowString.trim());
            
            // Map to trial object using correct indices
            const trial = {
                choice: values[3],                          // choice
                confidence: parseFloat(values[4]) || NaN,   // confidence
                risk_probability: parseInt(values[5]),      // risk_probability
                risk_reward: parseInt(values[6]),           // risk_reward
                safe_reward: parseInt(values[8])            // safe_reward
            };
            
            this.alphaEstimator.addChoice(trial);
        });
        
        // Estimate alpha
        const estimation = this.alphaEstimator.estimateAlpha();
        this.estimatedAlpha = estimation.alpha;
        
        console.log('=== PHASE 1 COMPLETE ===');
        console.log(`Estimated alpha: ${estimation.alpha.toFixed(3)}`);
        console.log(`Confidence: ${estimation.confidence.toFixed(1)}%`);
        console.log(`Choices analyzed: ${estimation.choices_analyzed}`);
        
        // Show transition screen
        document.body.innerHTML = `
            <div class="main-container">
                <div class="instructions" style="text-align: center; max-width: 700px; margin: 0 auto;">
                    <h2 style="color: var(--text-primary); margin-bottom: 2rem;">📊 Phase 1 Complete!</h2>
                    
                    <div style="background: #f0f8ff; border: 2px solid #4a90e2; border-radius: 8px; padding: 2rem; margin: 2rem 0;">
                        <h3 style="margin-top: 0; color: #4a90e2;">Your Risk Profile</h3>
                        <p style="font-size: 18px; margin: 1rem 0;">
                            Based on your ${estimation.choices_analyzed} choices, we've calibrated the experiment to your preferences.
                        </p>
                        <div style="background: white; padding: 1.5rem; border-radius: 6px; margin-top: 1.5rem;">
                            <p style="font-size: 16px; color: #666; margin: 0;">
                                Risk Aversion Parameter: <strong style="color: #4a90e2; font-size: 24px;">${estimation.alpha.toFixed(2)}</strong>
                            </p>
                            <p style="font-size: 14px; color: #999; margin-top: 0.5rem;">
                                ${this.getRiskProfileDescription(estimation.alpha)}
                            </p>
                        </div>
                    </div>
                    
                    <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 1.5rem; margin: 2rem 0;">
                        <h3 style="margin-top: 0; color: #856404;">📋 What's Next: Phase 2</h3>
                        <p style="color: #856404; margin: 0;">
                            The next phase contains ${this.experimentConfig.phase2Trials || 63} personalized trials based on your risk profile.
                            These trials are designed to be closer to your indifference points.
                        </p>
                    </div>
                    
                    <button class="next-button" onclick="experiment.beginPhase2()" style="margin-top: 2rem; font-size: 18px; padding: 15px 40px;">
                        Begin Phase 2
                    </button>
                </div>
            </div>
        `;
    },

    getRiskProfileDescription(alpha) {
        if (alpha < 0.5) {
            return "You tend to be quite risk-averse in your choices.";
        } else if (alpha < 0.75) {
            return "You show moderate risk aversion in your choices.";
        } else if (alpha < 1.0) {
            return "You show mild risk aversion in your choices.";
        } else if (alpha < 1.2) {
            return "You tend to be relatively risk-neutral in your choices.";
        } else {
            return "You tend to be risk-seeking in your choices.";
        }
    },

    async beginPhase2() {
        this.phase2Generator = new Phase2Generator(this.estimatedAlpha);
        
        // Always generate full set, then slice to desired count
        const fullPhase2Trials = this.phase2Generator.generatePhase2TrialsSubset();
        const phase2Trials = this.phase2Generator.getTrialsForExperiment();
        
        // Shuffle and take only the number specified in config
        const desiredCount = this.experimentConfig.phase2Trials || 63;
        this.trials = this.shuffle(phase2Trials).slice(0, desiredCount);
        
        // Add random risk_on_left
        this.trials = this.trials.map(trial => ({
            ...trial,
            risk_on_left: Math.random() < 0.5,
            is_practice: false
        }));
        
        this.currentPhase = 2;
        this.currentTrialIndex = 0;
        this.currentTimeline = this.trials;
        
        console.log(`=== STARTING PHASE 2 ===`);
        console.log(`Generated ${this.trials.length} personalized trials (from config: ${desiredCount})`);
        
        this.runNextTrial();
    },

    // Helper method for CSV parsing
    parseCSVRow(row) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < row.length; i++) {
            const char = row[i];
            const nextChar = row[i + 1];
            
            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current);
        return result;
    },

    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}); 