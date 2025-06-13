# Risk Survey Task - jsPsych Implementation

This is a complete implementation of a risk survey task using jsPsych, where participants make choices between risky and safe options while rating their confidence.

## Features

### Visual Design
- **Risky Option**: Vertical bar with red top section (winning probability) and blue bottom section (losing probability)
- **Safe Option**: Solid black bar representing 100% chance of winning
- **Size Variations**: 4 different size conditions randomly assigned to trials
  - Both options large (same size)
  - Both options small (same size) 
  - Risky option larger than safe option
  - Safe option larger than risky option
- **Spacing**: 144px (1.5 inches) between options as specified

### Trial Parameters
- **30 trials** with different combinations of:
  - Risk probabilities: 25%, 50%, 75%
  - Risk rewards: 100, 150, 200, 250, 300 points
  - Safe rewards: 50, 75, 100, 125, 150, 175, 200 points
- **Random positioning**: Risk option appears on left or right randomly
- **8-second time limit** per trial with countdown timer

### User Interaction
- **Choice selection**: Click buttons under each option or use "Choose Left/Right" buttons
- **Confidence rating**: 0-100 slider scale
- **Navigation**: Next button appears after choice is made
- **Auto-advance**: Trial advances automatically after 8 seconds if choice is made

## Files

- `index.html` - Main HTML file that loads jsPsych and runs the experiment
- `styles.css` - CSS styling for the visual elements and responsive design
- `experiment.js` - Main JavaScript file containing the experiment logic
- `README.md` - This documentation file

## How to Run

1. **Local Server**: Due to CORS restrictions, you need to run this on a local web server. You can use:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   
   # Node.js (if you have http-server installed)
   npx http-server
   ```

2. **Open in Browser**: Navigate to `http://localhost:8000` in your web browser

3. **Start Experiment**: Click "Start Experiment" on the instructions page

## Data Collection

The experiment automatically collects the following data for each trial:
- Trial number
- Risk probability and reward
- Safe reward
- Risk expected value
- Size condition
- Risk position (left/right)
- Participant's choice (left/right)
- Confidence rating (0-100)
- Response time (milliseconds)

## Customization

### Modifying Trial Parameters
Edit the `TRIAL_PARAMETERS` object in `experiment.js`:
```javascript
const TRIAL_PARAMETERS = {
    riskProbabilities: [25, 50, 75],  // Add/remove probabilities
    riskRewards: [100, 150, 200, 250, 300],  // Modify reward values
    safeRewards: [50, 75, 100, 125, 150, 175, 200],  // Modify safe values
    sizeConditions: ['both-large', 'both-small', 'risk-large', 'safe-large'],
    numTrials: 30  // Change number of trials
};
```

### Adjusting Visual Elements
Modify the CSS classes in `styles.css`:
- `.size-large` and `.size-small` for bar dimensions
- `.trial-container` gap for spacing between options
- Colors for risk bars (red/blue) and safe bar (black)

### Changing Trial Duration
Modify the `trial_duration` parameter in the timeline generation (currently 8000ms = 8 seconds).

## Browser Compatibility

This implementation works with modern browsers that support:
- ES6 JavaScript features
- CSS Flexbox
- HTML5 range inputs
- jsPsych 7.x

## Dependencies

- jsPsych 7.3.3 (loaded from CDN)
- jsPsych plugins (loaded from CDN):
  - html-button-response
  - instructions
  - survey-slider
  - survey-html-form

No additional installation required - all dependencies are loaded from CDN. 