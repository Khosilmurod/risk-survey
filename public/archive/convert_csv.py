import csv
import os

INPUT_FILE = 'indifference_trials.csv'   # same folder
OUTPUT_FILE = 'indifference_trials.csv'  # overwrite the same file

# Backup first (just in case)
if os.path.exists(INPUT_FILE):
    os.rename(INPUT_FILE, INPUT_FILE.replace('.csv', '_backup.csv'))
    print("💾 Backup created:", INPUT_FILE.replace('.csv', '_backup.csv'))

# Read original CSV
with open(INPUT_FILE.replace('.csv', '_backup.csv'), 'r') as f:
    reader = csv.DictReader(f)
    original_data = list(reader)

converted_data = []
for row in original_data:
    converted_row = {
        'trial_id': row['trial_id'],
        'combination_id': row['trial_id'],  # simple 1:1 mapping
        'risk_probability': row['risky_probability'],
        'risk_reward': row['risky_amount'],
        'safe_reward': row['safe'],
        'expected_value': row['safe'],  # indifference point
        'size_condition': 'both-large',  # default
        'risk_ratio': f"{row['risky_probability']}% × {row['risky_amount']} vs {row['safe']}"
    }
    converted_data.append(converted_row)

# Write back to same file
with open(OUTPUT_FILE, 'w', newline='') as f:
    fieldnames = [
        'trial_id', 'combination_id', 'risk_probability', 'risk_reward',
        'safe_reward', 'expected_value', 'size_condition', 'risk_ratio'
    ]
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(converted_data)

print(f"✅ Overwrote '{OUTPUT_FILE}' with {len(converted_data)} converted trials.")