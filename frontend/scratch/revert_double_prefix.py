import os
import re

def revert_double_prefix(content):
    # Revert tw:modifier:tw:utility to tw:modifier:utility
    # Group 1: tw: (modifier:)+
    # Group 2: tw: (which we remove)
    # Group 3: utility
    return re.sub(r'(tw:(?:[a-z0-9-]+:)+)tw:([a-z0-9-\[\]/.]+)', r'\1\2', content)

def process_directory(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.html') or file.endswith('.ts') or file.endswith('.css'):
                file_path = os.path.join(root, file)
                if file == 'styles.css':
                    continue
                
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = revert_double_prefix(content)
                
                if content != new_content:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Reverted double prefix in: {file_path}")

if __name__ == "__main__":
    process_directory('c:/viras/frontend/src/app')
