import csv

def parse_probability(prob_str):
    """Convert '25;75' format to just the first number (risk probability)"""
    return int(prob_str.split(';')[0])

def clean_number(num_str):
    """Remove quotes and commas from numbers"""
    if isinstance(num_str, str):
        return num_str.replace('"', '').replace(',', '')
    return str(num_str)

def create_new_trials_no_quotes():
    # Read values.csv and organize by condition
    conditions_data = {
        'risk-large': [],
        'safe-large': [],
        'both-large': [],
        'both-small': []
    }
    
    with open('/Users/khosilmurod/Desktop/Levy Lab/risk-survey/public/values.csv', 'r') as f:
        reader = csv.reader(f)
        for row in reader:
            condition = row[0]
            probability = parse_probability(row[1])
            risk_reward = int(clean_number(row[2]))
            safe_reward = int(clean_number(row[3]))
            
            conditions_data[condition].append({
                'probability': probability,
                'risk_reward': risk_reward,
                'safe_reward': safe_reward
            })
    
    # Create trials in the same style as full_trials.csv
    new_trials = []
    trial_id = 1
    combination_id = 1
    
    # Get the number of combinations (should be 30 based on one condition)
    num_combinations = len(conditions_data['risk-large'])
    
    # For each combination, create 4 trials (one for each condition)
    for i in range(num_combinations):
        # Get the values for this combination from risk-large (as reference)
        combo_data = conditions_data['risk-large'][i]
        
        # Create 4 trials for this combination in the correct order
        conditions_order = ['both-large', 'both-small', 'risk-large', 'safe-large']
        
        for condition in conditions_order:
            # Find matching data in this condition with same probability and values
            matching_data = None
            for item in conditions_data[condition]:
                if (item['probability'] == combo_data['probability'] and 
                    item['risk_reward'] == combo_data['risk_reward'] and 
                    item['safe_reward'] == combo_data['safe_reward']):
                    matching_data = item
                    break
            
            if matching_data:
                # Format risk_ratio WITHOUT commas to avoid quotes
                risk_ratio = f"{matching_data['probability']}% × {matching_data['risk_reward']} vs {matching_data['safe_reward']}"
                
                trial = {
                    'trial_id': trial_id,
                    'combination_id': combination_id,
                    'risk_probability': matching_data['probability'],
                    'risk_reward': matching_data['risk_reward'],
                    'safe_reward': matching_data['safe_reward'],
                    'expected_value': matching_data['safe_reward'],
                    'size_condition': condition,
                    'risk_ratio': risk_ratio
                }
                
                new_trials.append(trial)
                trial_id += 1
        
        combination_id += 1
    
    # Write to new.csv
    with open('/Users/khosilmurod/Desktop/Levy Lab/risk-survey/public/new.csv', 'w', newline='') as f:
        fieldnames = ['trial_id', 'combination_id', 'risk_probability', 'risk_reward', 'safe_reward', 'expected_value', 'size_condition', 'risk_ratio']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(new_trials)
    
    print(f"Created new.csv with {len(new_trials)} trials (no quotes in risk_ratio)")
    
    # Show preview of the first few groups
    print("\nFirst 16 rows showing the fixed formatting:")
    for i, trial in enumerate(new_trials[:16]):
        print(f"Row {i+1}: Trial {trial['trial_id']}, Combo {trial['combination_id']} - {trial['size_condition']} - {trial['risk_ratio']}")
    
    print(f"\nTotal combinations: {combination_id - 1}")
    print(f"Total trials: {len(new_trials)}")

if __name__ == "__main__":
    create_new_trials_no_quotes()
