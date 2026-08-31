import sys
import os

# Add parent directory to path to allow importing modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import db_manager

print("--- DB INSPECTION ---")
invs = db_manager.get_investigations()
print(f"Investigations: {len(invs)}")
for inv in invs:
    print(f"ID: {inv['id']} | Name: {inv['name']}")
    sources = db_manager.get_sources(inv['id'])
    print(f"  Sources: {len(sources)}")
    for s in sources:
        print(f"    - Type: {s['source_type']}")
        print(f"    - Path: {s['path']}")
        print(f"    - Exists: {os.path.exists(s['path'])}")
