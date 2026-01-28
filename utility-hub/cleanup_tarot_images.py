import os
import re

target_dir = r"c:\AiProject\utility-hub\utility-hub\backend\src\main\resources\static\images\tarot"

files = os.listdir(target_dir)

def rename_file(old_name, new_name):
    if old_name == new_name: return
    old_path = os.path.join(target_dir, old_name)
    new_path = os.path.join(target_dir, new_name)
    if os.path.exists(new_path):
        print(f"Skipping {old_name} -> {new_name} (Target already exists)")
        return
    try:
        os.rename(old_path, new_path)
        print(f"Renamed: {old_name} -> {new_name}")
    except Exception as e:
        print(f"Error renaming {old_name}: {e}")

# Manual mapping for remaining or missed ones
manual_map = {
    "Major_18.jpg": "major_18.jpg",
    "Major_18 (1).jpg": "major_18_backup.jpg",
}

for f, target in manual_map.items():
    if f in files:
        rename_file(f, target)

print("Manual cleanup finished.")
