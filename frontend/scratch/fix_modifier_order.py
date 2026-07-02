import os
import re

def fix_modifier_order(content):
    # Regex to find modifier:tw: and change it to tw:modifier:
    # It handles multiple modifiers like md:hover:tw: to tw:md:hover:
    # We look for one or more modifiers followed by tw:
    # The group 1 captures the modifiers (e.g. "md:hover:")
    # We replace it with "tw:" + group 1
    # Example: md:tw:p-12 -> tw:md:p-12
    # Example: hover:tw:bg-blue-600 -> tw:hover:bg-blue-600
    # Note: we need to handle the case where tw: was already at the utility but modifiers were outside.
    # The current state is modifier:tw:utility (e.g. md:tw:p-12)
    return re.sub(r'\b([a-z0-9-]+:)+tw:', r'tw:\1', content)

def process_directory(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.html') or file.endswith('.ts') or file.endswith('.css'):
                file_path = os.path.join(root, file)
                if file == 'styles.css':
                    continue
                
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = fix_modifier_order(content)
                
                if content != new_content:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated modifiers in: {file_path}")

if __name__ == "__main__":
    process_directory('c:/viras/frontend/src/app')
