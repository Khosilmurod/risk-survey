# CSV-Compatible Data Structure Improvements

## Current vs Improved Headers

### Current (Confusing):
```
Sub,Trial,Condition,Condition_Response_1_or_2,Confidence_1_100,Page_Entry_Time,Bar_Choice_Time,Page_Submit_Time,Test_Condition,Risk_Condition,Risky_Option_Amount,Safe_Option_Amount,EV_Condition
```

### Improved (Clear & Understandable):
```
participant_id,trial_number,trial_type,bar_size_condition,choice,confidence,risk_probability,risk_reward,safe_reward,expected_value,risk_position,page_load_time,choice_time,submit_time,reaction_time,confidence_time,original_trial_id,combination_id,session_timestamp
```

## Field Improvements

### 1. Clear Identification
- `participant_id` (was: Sub) - Clear what this represents
- `trial_number` (was: Trial) - Keep simple
- `trial_type` (NEW) - "practice" or "main"

### 2. Understandable Response Data
- `choice` (was: Condition_Response_1_or_2) - Values: "risk" or "safe"
- `confidence` (was: Confidence_1_100) - Just the number 0-100

### 3. Clear Trial Configuration
- `bar_size_condition` (was: Condition) - "both_large", "both_small", etc.
- `risk_probability` (was: part of Risk_Condition) - Just the number: 75
- `risk_reward` (was: Risky_Option_Amount) - Clear naming
- `safe_reward` (was: Safe_Option_Amount) - Clear naming
- `expected_value` (was: EV_Condition) - Actual number, not "Same"
- `risk_position` (NEW) - "left" or "right"

### 4. Better Timing Data
- `page_load_time` (was: Page_Entry_Time) - When trial page loaded
- `choice_time` (was: Bar_Choice_Time) - When participant clicked choice
- `submit_time` (was: Page_Submit_Time) - When clicked next/submitted
- `reaction_time` (NEW) - choice_time - page_load_time
- `confidence_time` (NEW) - submit_time - choice_time

### 5. Research Metadata
- `original_trial_id` (NEW) - ID from CSV file (for tracking)
- `combination_id` (NEW) - Which combination from your generated set
- `session_timestamp` (NEW) - When experiment started

## Removed Fields
- `Test_Condition` - Was duplicate of Condition
- `Risk_Condition` - Split into risk_probability and (100-risk_probability)

## Example Data Row

### Before (Confusing):
```
"1","1","both-large","1","71","3.504","4.854","6.806","both-large","75,25","300","150","Same"
```

### After (Clear):
```
SUBJ001,1,main,both_large,risk,71,75,300,150,225,left,3.504,4.854,6.806,1.350,1.952,45,12,2024-12-20T14:30:52Z
```

## Benefits of This Approach

### ✅ Maintains CSV Compatibility
- Still flat structure that works with Excel/R/Python
- Can be imported into any analysis software
- Easy to convert to other formats if needed

### ✅ Self-Documenting
- Field names explain what they contain
- No need to remember "1=risk, 2=safe"
- Values are human-readable

### ✅ Analysis-Friendly
- Pre-computed timing metrics (reaction_time, confidence_time)
- Boolean-style text values easy to filter
- Proper data types for statistical software

### ✅ Research-Ready
- Contains all metadata needed for analysis
- Tracks original trial source
- Session information for multi-session studies

## Implementation Strategy

1. **Update JavaScript data collection**
2. **Modify server CSV generation**
3. **Add computed fields automatically**
4. **Maintain backward compatibility option** 