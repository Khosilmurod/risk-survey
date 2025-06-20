# Improved Data Structure for Risk Survey

## Current Issues
- Confusing field names (Condition_Response_1_or_2, Confidence_1_100)
- Redundant fields (Condition vs Test_Condition)
- Unclear response encoding (1 vs 2 for risk vs safe)
- Missing important metadata
- Poor data organization

## Proposed New Structure

### Trial-Level Data (Main Collection)
```json
{
  // Participant Info
  "participant_id": "SUBJ001",
  "session_id": "ses_20241220_143052",
  "experiment_version": "1.0",
  "timestamp": "2024-12-20T14:30:52.123Z",
  
  // Trial Identification
  "trial_number": 1,
  "trial_type": "main", // or "practice"
  "original_trial_id": 45, // from CSV
  "combination_id": 12,
  
  // Trial Configuration
  "bar_size_condition": "both_large",
  "risk_probability": 75,
  "risk_reward": 300,
  "safe_reward": 150,
  "expected_value": 150,
  "risk_position": "left", // or "right"
  
  // Participant Response
  "choice": "risk", // or "safe" - much clearer!
  "confidence": 71,
  "response_time": {
    "page_load": 3.504,
    "choice_made": 4.854,
    "form_submitted": 6.806,
    "total_trial_time": 6.806
  },
  
  // Computed Fields
  "chose_higher_ev": false,
  "reaction_time": 1.350, // choice_made - page_load
  "confidence_time": 1.952 // form_submitted - choice_made
}
```

### Session-Level Metadata (Separate Collection)
```json
{
  "participant_id": "SUBJ001",
  "session_id": "ses_20241220_143052", 
  "start_time": "2024-12-20T14:30:52.123Z",
  "end_time": "2024-12-20T14:45:31.456Z",
  "experiment_version": "1.0",
  "browser_info": "Chrome 120.0.0",
  "screen_resolution": "1920x1080",
  "total_trials_completed": 72,
  "practice_trials_completed": 5,
  "attention_checks_completed": 3,
  "completion_status": "completed", // or "incomplete"
  "trial_source": "generated_csv_v1.0"
}
```

## Key Improvements

### 1. Clear, Descriptive Field Names
- `choice`: "risk" or "safe" (not 1 or 2)
- `confidence`: Just the number (not Confidence_1_100)
- `bar_size_condition`: Descriptive (not just "Condition")

### 2. Structured Time Data
- Separate timing events instead of confusing mixed fields
- Clear labels for what each time represents
- Computed reaction times

### 3. Rich Metadata
- Session tracking for multi-session studies
- Experiment versioning
- Technical details for debugging
- Completion tracking

### 4. Analysis-Friendly Fields
- `chose_higher_ev`: Boolean for easy analysis
- `reaction_time`: Pre-computed for convenience
- Proper data types (numbers vs strings)

### 5. No Redundancy
- Single source of truth for each piece of information
- No duplicate fields
- Meaningful field names

## Migration Strategy
1. Update JavaScript to use new field names
2. Update server to handle new structure
3. Add data transformation layer for backward compatibility
4. Gradually migrate to new structure 