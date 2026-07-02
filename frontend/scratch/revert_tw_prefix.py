import os
import re

def replace_tw_prefix(content):
    # This regex looks for tw- followed by a word character
    # It handles cases like tw-flex, md:tw-flex, hover:tw-bg-blue-600
    # We replace tw- with tw:
    return re.sub(r'\btw-', 'tw:', content)

def process_directory(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.html') or file.endswith('.ts') or file.endswith('.css'):
                file_path = os.path.join(root, file)
                # Skip styles.css as we already handled it manually or might want special care
                if file == 'styles.css':
                    continue
                
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = replace_tw_prefix(content)
                
                if content != new_content:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated: {file_path}")

if __name__ == "__main__":
    process_directory('c:/viras/frontend/src/app')
