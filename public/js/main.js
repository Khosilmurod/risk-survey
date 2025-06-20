/**
 * main.js - Experiment Entry Point
 * 
 * This is the MAIN file that starts the entire Risk Survey Experiment.
 * It initializes the experiment when the page loads.
 * 
 * File Dependencies (loaded in this order):
 * 1. Experiment.js     - Core experiment class
 * 2. Pages.js          - UI pages (welcome, instructions)
 * 3. TrialManager.js   - Trial generation and flow
 * 4. TrialRunner.js    - Individual trial execution
 * 5. DataCollector.js  - Data saving and export
 * 6. main.js           - THIS FILE (starts everything)
 */

// Initialize experiment when page loads
const experiment = new RiskSurveyExperiment();
document.addEventListener('DOMContentLoaded', () => {
    experiment.init();
}); 