import os
import re

def fix_double_prefix(content):
    # Regex to find tw: followed by one or more modifiers, then a utility name
    # We want to insert 'tw:' before the base utility name if it's missing.
    # Pattern: tw: (modifier:)+ (not tw:) (utility)
    # Group 1: tw: (modifier:)+
    # Group 2: utility
    return re.sub(r'(tw:(?:[a-z0-9-]+:)+)(?!tw:)([a-z0-9-\[\]/.]+)', r'\1tw:\2', content)

def process_directory(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.html') or file.endswith('.ts') or file.endswith('.css'):
                file_path = os.path.join(root, file)
                if file == 'styles.css':
                    continue
                
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = fix_double_prefix(content)
                
                if content != new_content:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated double prefix in: {file_path}")

if __name__ == "__main__":
    process_directory('c:/viras/frontend/src/app')
