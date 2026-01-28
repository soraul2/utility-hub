import os
import re

target_dir = r"c:\AiProject\utility-hub\utility-hub\backend\src\main\resources\static\images\tarot"

if not os.path.exists(target_dir):
    print(f"Directory {target_dir} does not exist.")
    exit(1)

# Patterns that we want to KEEP
keep_patterns = [
    re.compile(r"^major_\d+\.jpg$", re.IGNORECASE),
    re.compile(r"^cups_\d+\.jpg$", re.IGNORECASE),
    re.compile(r"^wands_\d+\.jpg$", re.IGNORECASE),
    re.compile(r"^swords_\d+\.jpg$", re.IGNORECASE),
    re.compile(r"^pentacles_\d+\.jpg$", re.IGNORECASE)
]

files = os.listdir(target_dir)
deleted_count = 0

for f in files:
    should_keep = False
    for pattern in keep_patterns:
        if pattern.match(f):
            # Special check for case sensitivity if needed, but the JSON uses lowercase
            # Let's ensure they are lowercase while we're at it if they match but are uppercase
            if f != f.lower() and not f.startswith("major_18_backup"): # backup is temporary
                 old_path = os.path.join(target_dir, f)
                 new_path = os.path.join(target_dir, f.lower())
                 if not os.path.exists(new_path):
                     os.rename(old_path, new_path)
                     print(f"Fixed case: {f} -> {f.lower()}")
                     f = f.lower()
            
            should_keep = True
            break
    
    if not should_keep:
        file_path = os.path.join(target_dir, f)
        try:
            if os.path.isfile(file_path):
                os.remove(file_path)
                print(f"Deleted unnecessary file: {f}")
                deleted_count += 1
        except Exception as e:
            print(f"Error deleting {f}: {e}")

print(f"Cleanup complete. Deleted {deleted_count} files.")
