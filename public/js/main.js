/**
 * main.js - Experiment Entry Point
 * 
 * This is the MAIN file that starts the entire Risk Survey Experiment.
 * It initializes the experiment when the page loads.
 * 
 * File Dependencies (loaded in this order):
 * 1. Experiment.js         - Core experiment class
 * 2. Pages.js              - UI pages (welcome, instructions)
 * 3. ComprehensionCheck.js - Check for user understanding of tasks
 * 4. TrialManager.js       - Trial generation and flow
 * 5. TrialRunner.js        - Individual trial execution
 * 6. DataCollector.js      - Data saving and export
 * 7. main.js               - THIS FILE (starts everything)
 */

// Initialize experiment when page loads
const experiment = new RiskSurveyExperiment();
document.addEventListener('DOMContentLoaded', () => {
    experiment.init();
}); 