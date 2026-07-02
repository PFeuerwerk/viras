import os
import re

def fix_custom_animations(content):
    # Revert tw:animate-fade-in to animate-fade-in
    content = content.replace('tw:animate-fade-in', 'animate-fade-in')
    content = content.replace('tw:animate-scale-up', 'animate-scale-up')
    return content

def process_directory(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.html') or file.endswith('.ts') or file.endswith('.css'):
                file_path = os.path.join(root, file)
                
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = fix_custom_animations(content)
                
                if content != new_content:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Fixed animations in: {file_path}")

if __name__ == "__main__":
    process_directory('c:/viras/frontend/src/app')
