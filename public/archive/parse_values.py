import csv

def parse_probability(prob_str):
    """Convert '25;75' format to just the first number (risk probability)"""
    return int(prob_str.split(';')[0])

def clean_number(num_str):
    """Remove quotes and commas from numbers"""
    if isinstance(num_str, str):
        return num_str.replace('"', '').replace(',', '')
    return str(num_str)

def create_new_trials_from_values():
    # Read values.csv
    values_data = []
    with open('/Users/khosilmurod/Desktop/Levy Lab/risk-survey/public/values.csv', 'r') as f:
        reader = csv.reader(f)
        for row in reader:
            condition = row[0]  # risk-large, safe-large, both-large, both-small
            probability = parse_probability(row[1])  # 25, 50, or 75
            risk_reward = int(clean_number(row[2]))
            safe_reward = int(clean_number(row[3]))
            values_data.append({
                'condition': condition,
                'probability': probability,
                'risk_reward': risk_reward,
                'safe_reward': safe_reward
            })
    
    # Group by probability and values (to create combination_id)
    combinations = {}
    combination_counter = 1
    
    # Create new trials data
    new_trials = []
    trial_id = 1
    
    for item in values_data:
        # Create a unique key for this combination of probability and values
        combo_key = (item['probability'], item['risk_reward'], item['safe_reward'])
        
        if combo_key not in combinations:
            combinations[combo_key] = combination_counter
            combination_counter += 1
        
        combination_id = combinations[combo_key]
        
        # Create the trial entry
        trial = {
            'trial_id': trial_id,
            'combination_id': combination_id,
            'risk_probability': item['probability'],
            'risk_reward': item['risk_reward'],
            'safe_reward': item['safe_reward'],
            'expected_value': item['safe_reward'],  # Assuming expected value equals safe reward
            'size_condition': item['condition'],
            'risk_ratio': f"{item['probability']}% × {item['risk_reward']:,} vs {item['safe_reward']:,}"
        }
        
        new_trials.append(trial)
        trial_id += 1
    
    # Write to new.csv
    with open('/Users/khosilmurod/Desktop/Levy Lab/risk-survey/public/new.csv', 'w', newline='') as f:
        fieldnames = ['trial_id', 'combination_id', 'risk_probability', 'risk_reward', 'safe_reward', 'expected_value', 'size_condition', 'risk_ratio']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(new_trials)
    
    print(f"Created new.csv with {len(new_trials)} trials from values.csv")
    
    # Show preview
    print("\nFirst 10 rows of new.csv:")
    for i, trial in enumerate(new_trials[:10]):
        print(f"Row {i+1}: Trial {trial['trial_id']} - {trial['size_condition']} - {trial['risk_probability']}% × {trial['risk_reward']:,} vs {trial['safe_reward']:,}")
    
    print(f"\nTotal combinations found: {combination_counter - 1}")
    print(f"Total trials created: {len(new_trials)}")

if __name__ == "__main__":
    create_new_trials_from_values()
