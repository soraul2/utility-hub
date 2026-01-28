import os
import re

target_dir = r"c:\AiProject\utility-hub\utility-hub\backend\src\main\resources\static\images\tarot"

if not os.path.exists(target_dir):
    print(f"Directory {target_dir} does not exist.")
    exit(1)

files = os.listdir(target_dir)

def rename_file(old_name, new_name):
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

# Patterns
# RWS_Tarot_00_Fool.jpg -> major_0.jpg
major_pattern = re.compile(r"RWS_Tarot_(\d+)_.*\.jpg", re.IGNORECASE)
# Major_18.jpg -> major_18.jpg
major_pattern_alt = re.compile(r"Major_(\d+).*\.jpg", re.IGNORECASE)
# Cups01.jpg -> cups_1.jpg
cups_pattern = re.compile(r"Cups(\d+).*\.jpg", re.IGNORECASE)
# Wands01.jpg -> wands_1.jpg
wands_pattern = re.compile(r"Wands(\d+).*\.jpg", re.IGNORECASE)
# Swords01.jpg -> swords_1.jpg
swords_pattern = re.compile(r"Swords(\d+).*\.jpg", re.IGNORECASE)
# Pents01.jpg -> pentacles_1.jpg
pents_pattern = re.compile(r"Pents(\d+).*\.jpg", re.IGNORECASE)

# Special cases
# Tarot_Nine_of_Wands.jpg -> wands_9.jpg
special_cases = {
    "Tarot_Nine_of_Wands.jpg": "wands_9.jpg",
    "The_Devil_(Major_Arcana_Tarot_Card).jpg": "major_15.jpg",
    "RWS_Tarot_00_Fool.jpg": "major_0.jpg",
}

for f in files:
    # Skip if it has (1), (2) etc unless we need it
    if "(" in f:
        continue
    
    if f in special_cases:
        rename_file(f, special_cases[f])
        continue

    # Major
    m = major_pattern.match(f)
    if m:
        num = int(m.group(1))
        rename_file(f, f"major_{num}.jpg")
        continue
    
    m = major_pattern_alt.match(f)
    if m:
        num = int(m.group(1))
        rename_file(f, f"major_{num}.jpg")
        continue

    # Cups
    m = cups_pattern.match(f)
    if m:
        num = int(m.group(1))
        rename_file(f, f"cups_{num}.jpg")
        continue

    # Wands
    m = wands_pattern.match(f)
    if m:
        num = int(m.group(1))
        rename_file(f, f"wands_{num}.jpg")
        continue

    # Swords
    m = swords_pattern.match(f)
    if m:
        num = int(m.group(1))
        rename_file(f, f"swords_{num}.jpg")
        continue

    # Pents
    m = pents_pattern.match(f)
    if m:
        num = int(m.group(1))
        rename_file(f, f"pentacles_{num}.jpg")
        continue

print("Renaming process finished.")
