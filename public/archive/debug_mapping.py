import csv

def parse_probability(prob_str):
    """Convert '25;75' format to just the first number (risk probability)"""
    return int(prob_str.split(';')[0])

def clean_number(num_str):
    """Remove quotes and commas from numbers"""
    if isinstance(num_str, str):
        return num_str.replace('"', '').replace(',', '')
    return str(num_str)

# Debug: Check values.csv mapping
print("Values from values.csv:")
values_map = {}
with open('/Users/khosilmurod/Desktop/Levy Lab/risk-survey/public/values.csv', 'r') as f:
    reader = csv.reader(f)
    for i, row in enumerate(reader):
        if i < 10:  # Show first 10 rows
            condition = row[0]
            probability = parse_probability(row[1])
            risk_reward = clean_number(row[2])
            safe_reward = clean_number(row[3])
            key = (condition, probability)
            values_map[key] = {
                'risk_reward': int(risk_reward),
                'safe_reward': int(safe_reward)
            }
            print(f"Row {i+1}: {condition}, {probability}% -> risk:{risk_reward}, safe:{safe_reward}")

print("\nChecking first few trials from full_trials.csv:")
with open('/Users/khosilmurod/Desktop/Levy Lab/risk-survey/public/full_trials.csv', 'r') as f:
    reader = csv.DictReader(f)
    for i, row in enumerate(reader):
        if i < 10:  # Show first 10 rows
            condition = row['size_condition']
            probability = int(row['risk_probability'])
            key = (condition, probability)
            print(f"Trial {i+1}: {condition}, {probability}% -> Looking for key: {key}")
            if key in values_map:
                print(f"  Found match: {values_map[key]}")
            else:
                print(f"  No match found")
