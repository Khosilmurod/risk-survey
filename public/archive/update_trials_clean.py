import csv

def parse_probability(prob_str):
    """Convert '25;75' format to just the first number (risk probability)"""
    return int(prob_str.split(';')[0])

def clean_number(num_str):
    """Remove quotes and commas from numbers"""
    if isinstance(num_str, str):
        return num_str.replace('"', '').replace(',', '')
    return str(num_str)

def update_trials_with_values():
    # Read values.csv
    values_data = []
    with open('/Users/khosilmurod/Desktop/Levy Lab/risk-survey/public/values.csv', 'r') as f:
        reader = csv.reader(f)
        for row in reader:
            condition = row[0]
            probability = parse_probability(row[1])
            risk_reward = clean_number(row[2])
            safe_reward = clean_number(row[3])
            values_data.append({
                'condition': condition,
                'probability': probability,
                'risk_reward': int(risk_reward),
                'safe_reward': int(safe_reward)
            })
    
    # Create a mapping from values.csv
    values_map = {}
    for item in values_data:
        key = (item['condition'], item['probability'])
        values_map[key] = {
            'risk_reward': item['risk_reward'],
            'safe_reward': item['safe_reward']
        }
    
    # Read full_trials.csv
    trials_data = []
    with open('/Users/khosilmurod/Desktop/Levy Lab/risk-survey/public/full_trials.csv', 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            condition = row['size_condition']
            probability = int(row['risk_probability'])
            
            # Find matching values
            key = (condition, probability)
            if key in values_map:
                new_values = values_map[key]
                row['risk_reward'] = str(new_values['risk_reward'])
                row['safe_reward'] = str(new_values['safe_reward'])
                row['expected_value'] = str(new_values['safe_reward'])  # Expected value equals safe reward
                
                # Update risk_ratio column
                risk_formatted = f"{new_values['risk_reward']:,}"
                safe_formatted = f"{new_values['safe_reward']:,}"
                row['risk_ratio'] = f"{probability}% × {risk_formatted} vs {safe_formatted}"
            
            trials_data.append(row)
    
    # Write updated data back to file
    with open('/Users/khosilmurod/Desktop/Levy Lab/risk-survey/public/full_trials.csv', 'w', newline='') as f:
        fieldnames = ['trial_id', 'combination_id', 'risk_probability', 'risk_reward', 'safe_reward', 'expected_value', 'size_condition', 'risk_ratio']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(trials_data)
    
    print("Updated full_trials.csv with values from values.csv")
    
    # Show a preview of changes
    print("\nFirst few rows of updated file:")
    for i, row in enumerate(trials_data[:10]):
        print(f"Row {i+1}: {row['size_condition']} - {row['risk_probability']}% × {row['risk_reward']} vs {row['safe_reward']}")

if __name__ == "__main__":
    update_trials_with_values()
