import csv
import itertools

def generate_risk_combinations():
    """Generate 30 risk preference combinations with equal expected values"""
    
    combinations = []
    
    # Define the probabilities and corresponding safe rewards
    probabilities = [25, 50, 75]
    safe_rewards_base = [60, 90, 120, 150, 180, 210, 240, 270, 300, 330]
    
    combination_id = 1
    
    for prob in probabilities:
        for safe_reward in safe_rewards_base:
            # Calculate risk reward for equal expected value
            # EV = (prob/100) * risk_reward = safe_reward
            # Therefore: risk_reward = safe_reward * (100/prob)
            risk_reward = int(safe_reward * (100 / prob))
            
            combination = {
                'combination_id': combination_id,
                'risk_probability': prob,
                'risk_reward': risk_reward,
                'safe_reward': safe_reward,
                'expected_value': safe_reward,  # Both options have same EV
                'risk_ratio': f'{prob}% × {risk_reward} vs {safe_reward}'
            }
            
            combinations.append(combination)
            combination_id += 1
    
    return combinations

def generate_full_trial_set(combinations, filename='public/full_trials.csv'):
    """Generate full trial set with size conditions (120 trials total)"""
    
    size_conditions = ['both-large', 'both-small', 'risk-large', 'safe-large']
    full_trials = []
    trial_id = 1
    
    for combo in combinations:
        for size_condition in size_conditions:
            trial = {
                'trial_id': trial_id,
                'combination_id': combo['combination_id'],
                'risk_probability': combo['risk_probability'],
                'risk_reward': combo['risk_reward'],
                'safe_reward': combo['safe_reward'],
                'expected_value': combo['expected_value'],
                'size_condition': size_condition,
                'risk_ratio': combo['risk_ratio']
            }
            
            full_trials.append(trial)
            trial_id += 1
    
    # Save full trial set
    fieldnames = ['trial_id', 'combination_id', 'risk_probability', 'risk_reward', 
                  'safe_reward', 'expected_value', 'size_condition', 'risk_ratio']
    
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        
        for trial in full_trials:
            writer.writerow(trial)
    
    print(f"✅ Generated {len(full_trials)} total trials")
    print(f"📁 Saved to: {filename}")
    
    return full_trials

def print_summary(combinations):
    """Print a summary of the generated combinations"""
    
    print("\n📊 COMBINATION SUMMARY:")
    print("=" * 50)
    
    by_probability = {}
    for combo in combinations:
        prob = combo['risk_probability']
        if prob not in by_probability:
            by_probability[prob] = []
        by_probability[prob].append(combo)
    
    for prob in sorted(by_probability.keys()):
        print(f"\n{prob}% Probability ({len(by_probability[prob])} combinations):")
        for combo in by_probability[prob][:3]:  # Show first 3
            print(f"  {combo['risk_ratio']} (EV={combo['expected_value']})")
        if len(by_probability[prob]) > 3:
            print(f"  ... and {len(by_probability[prob])-3} more")

def print_instructions():
    """Print instructions for customizing the script"""
    
    print("\n🔧 CUSTOMIZATION INSTRUCTIONS:")
    print("=" * 50)
    print("To modify the trial generation, edit these variables in the script:")
    print("• probabilities: List of risk probabilities (e.g., [25, 50, 75])")
    print("• safe_rewards_base: List of safe reward amounts (e.g., [60, 90, 120, ...])")
    print("• size_conditions: List of bar size conditions (e.g., ['both-large', 'both-small', ...])")
    print("\nRisk rewards are automatically calculated to maintain equal expected values.")
    print("Run 'python3 generate_trials.py' after making changes.")

if __name__ == "__main__":
    print("🎯 Generating Risk Preference Trial Set...")
    
    # Generate the 30 value combinations
    combinations = generate_risk_combinations()
    
    # Generate and save full trial set (120 trials) - this is the only file needed
    full_trials = generate_full_trial_set(combinations, 'public/full_trials.csv')
    
    # Print summary
    print_summary(combinations)
    
    # Print customization instructions
    print_instructions()
    
    print(f"\n🎉 Done! Generated 'public/full_trials.csv' with {len(full_trials)} trials")
    print("The JavaScript experiment will automatically load trials from this CSV file.") 