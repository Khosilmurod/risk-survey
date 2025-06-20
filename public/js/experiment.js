// Risk Survey Task Implementation with jsPsych

// Import trial modules (these will be created as separate files)
// These should define: getPracticeTimeline(), getMainTrialsTimeline(), getAttentionChecksTimeline()
// In a real setup, use ES6 imports or load via <script> tags in index.html
// For now, assume these functions are globally available after their respective files are loaded

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

// --- Global Data Storage ---
let csvData = [];
let trialCounter = 1;

// Function to add a row to the CSV data
function addDataRow(data) {
    // Only add data for main trials (which are not attention checks and not practice trials)
    if (data.trial_type === 'attention_check' || (data.trial_number && data.trial_number.toString().startsWith('practice'))) {
        return; // Do not save data for attention checks or practice trials
    }
    
    // For main trials, format and add the row
    const row = [
        `"sub1"`,
        trialCounter++,
        `"${data.condition}"`,
        `"${data.choice === 'risk' ? 1 : 2}"`,
        data.confidence,
        data.page_entry_time,
        data.bar_choice_time,
        data.page_submit_time,
        `"${data['Test Condition']}"`,
        `"${data['Risk Condition']}"`,
        data['Risky Option Amount'],
        data['Safe Option Amount'],
        `"${data['EV Condition']}"`
    ].join(',') + '\n';
    
    csvData.push(row);
}

const jsPsych = initJsPsych({
    on_finish: function() {
        // Immediately display the saving message
        jsPsych.getDisplayElement().innerHTML = `
            <div class="instructions">
                <h2>Completing the experiment...</h2>
                <p>Please wait while your data is being saved.</p>
            </div>`;

        fetch('/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: csvData.join('') }),
        })
        .then(response => {
            if (response.ok) {
                // Display a success message on the screen
                jsPsych.getDisplayElement().innerHTML = `
                    <div class="instructions">
                        <h2>Thank You</h2>
                        <div style="border: 1px solid #e5e5e5; padding: 2rem; border-radius: 4px; margin: 2rem 0; background: #fafafa;">
                            <p style="font-size: 18px; margin-bottom: 1rem;">You have successfully completed the risk survey task.</p>
                            <p style="color: green; font-weight: bold;">Your responses have been successfully saved.</p>
                        </div>
                        <p>You may now close this window.</p>
                    </div>`;
            } else {
                // Display an error message
                jsPsych.getDisplayElement().innerHTML = `
                    <div class="instructions">
                        <h2>Error</h2>
                        <div style="border: 1px solid #e5e5e5; padding: 2rem; border-radius: 4px; margin: 2rem 0; background: #fafafa; color: red;">
                            <p>There was an error saving your data. Please contact the researcher.</p>
                        </div>
                    </div>`;
            }
        })
        .catch(err => {
            console.error('Error saving data:', err)
            // Display a network error message
            jsPsych.getDisplayElement().innerHTML = `
                <div class="instructions">
                    <h2>Error</h2>
                    <div style="border: 1px solid #e5e5e5; padding: 2rem; border-radius: 4px; margin: 2rem 0; background: #fafafa; color: red;">
                        <p>A network error occurred. Please check your connection and contact the researcher.</p>
                    </div>
                </div>`;
        });
    }
});

async function initExperiment() {
    try {
        const response = await fetch('config.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const config = await response.json();
        runExperiment(config);
    } catch (error) {
        console.error("Could not load experiment configuration:", error);
        // Display an error message to the user
        jsPsych.getDisplayElement().innerHTML = `
            <div class="instructions">
                <h2>Error</h2>
                <div style="border: 1px solid #e5e5e5; padding: 2rem; border-radius: 4px; margin: 2rem 0; background: #fafafa; color: red;">
                    <p>Could not load experiment configuration. Please contact the researcher.</p>
                </div>
            </div>`;
    }
}

function runExperiment(configData) {
    const { experimentConfig, attentionCheckQuestions } = configData;
    const timeline = [];

    // Instructions
    timeline.push({
        type: jsPsychInstructions,
        pages: [
            `<div class="instructions" style="text-align: left; max-width: 800px; margin: auto;">
                <h2>Instructions for the Decision-Making Task</h2>
                <p>In this study, you will be making decisions between different monetary choices. These choices represent hypothetical situations, but you should choose as if the decisions were real.</p>
                
                <h3>1. Understanding Monetary Choices</h3>
                <p>On each screen, you will be presented with two options—one will be a lottery, and the other will be a guaranteed amount.</p>
                
                <div>
                    <p style="margin-left: 20px;"><strong>&bull; Option 1:</strong> A lottery has two possible outcomes. In the example below, the outcomes are 200 points or 0. The red and blue areas and the numbers within them represent the chance for obtaining these outcomes. There is a 75% chance of obtaining 200 points and a 25% chance of obtaining 0 points.</p>
                    <div class="option" style="margin: 1rem auto;">
                        <div class="option-label option-label-top">200</div>
                        <div class="risk-bar size-small">
                            <div class="risk-bar-red" style="height: 75%;">75%</div>
                            <div class="risk-bar-blue" style="height: 25%;">25%</div>
                        </div>
                        <div class="option-label option-label-bottom">0</div>
                    </div>
                </div>

                <div>
                    <p style="margin-left: 20px;"><strong>&bull; Option 2:</strong> A guaranteed outcome where you have a 100% chance (shown in the black bar) to win a specific number of points, such as 150 points seen in this example.</p>
                    <div class="option" style="margin: 1rem auto;">
                        <div class="option-label option-label-top">150</div>
                        <div class="safe-bar size-small">
                            100%
                        </div>
                        <div class="option-label option-label-bottom" style="visibility: hidden;">0</div>
                    </div>
                </div>
            </div>`
        ],
        show_clickable_nav: true,
        button_label_next: "Start",
        on_load: function() {
            document.querySelector('.jspsych-content').classList.add('no-prev-btn');
        }
    });

    // Practice trials from config
    timeline.push(...getPracticeTimeline(experimentConfig.practiceTrials));

    // Transition to main trials
    timeline.push({
        type: jsPsychHtmlButtonResponse,
        stimulus: `
            <div style="text-align: center;">
                <p style="font-size: 18px; color: var(--text-secondary); margin-bottom: var(--spacing-md);">Practice complete. The main trials will now begin.</p>
                <div class="navigation">
                    <button id="begin-main-trials-btn" class="next-button">Begin</button>
                </div>
            </div>
        `,
        choices: [],
        on_load: function() {
            const btn = document.getElementById('begin-main-trials-btn');
            btn.addEventListener('click', () => {
                if (document.fullscreenElement === null) {
                    document.documentElement.requestFullscreen().then(() => jsPsych.finishTrial());
                } else {
                    jsPsych.finishTrial();
                }
            });
        }
    });

    // Main trials from config
    const mainTrials = getMainTrialsTimeline(experimentConfig.mainTrials, experimentConfig.trialDuration);
    
    // Attention checks from config
    const attentionChecks = getAttentionChecks(
        jsPsych.randomization.sampleWithoutReplacement(attentionCheckQuestions, experimentConfig.attentionChecks)
    );

    // Intersperse attention checks into main trials
    let finalTimeline = [];
    if (attentionChecks.length > 0 && mainTrials.length > 0) {
        const attentionCheckInterval = Math.floor(mainTrials.length / (attentionChecks.length + 1));
        let mainTrialCounter = 0;
        while (mainTrialCounter < mainTrials.length) {
            finalTimeline.push(mainTrials[mainTrialCounter]);
            if ((mainTrialCounter + 1) % attentionCheckInterval === 0 && attentionChecks.length > 0) {
                finalTimeline.push(attentionChecks.shift());
            }
            mainTrialCounter++;
        }
        // Add any remaining attention checks
        finalTimeline.push(...attentionChecks);
    } else {
        finalTimeline = mainTrials;
    }

    timeline.push(...finalTimeline);

    jsPsych.run(timeline);
}

initExperiment(); 