/**
 * Risk Survey Experiment - Main Class
 * Core experiment class definition with constructor and initialization
 */

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
        this.currentConfidence = null;
        this.trialStartTime = null;
        this.pageEntryTime = null;
        this.barChoiceTime = null;
        this.sliderInteracted = false;
        
        // Session tracking
        this.sessionId = `ses_${new Date().toISOString().replace(/[-:]/g, '').substring(0, 15)}`;
        this.sessionStartTime = new Date().toISOString();
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
            await this.generateTrials();
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

        // Use config font sizes
        const largeFontSize = this.experimentConfig.fontSizes.large;
        const smallFontSize = this.experimentConfig.fontSizes.small;

        styleElement.textContent = `
            .size-large, .size-large.risk-bar, .size-large.safe-bar {
                width: ${largeWidth}px !important;
                height: ${largeHeight}px !important;
                font-size: ${largeFontSize}px !important;
            }
            
            .size-large .risk-bar-red, .size-large .risk-bar-blue {
                font-size: ${largeFontSize}px !important;
            }
            
            .size-large .option-label {
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
            
            .size-small .option-label {
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
                
                .size-large .option-label {
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
                
                .size-small .option-label {
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
                
                .size-large .option-label {
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
                
                .size-small .option-label {
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
} 