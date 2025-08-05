#!/usr/bin/env python3
import json
from datetime import datetime

def convert_links():
    # Read the input file
    with open("links.json", "r") as f:
        data = json.load(f)
    
    # Convert each entry
    converted = []
    for i, entry in enumerate(data, 1):
        new_entry = {
            "uid": f"apc-{i:03d}",
            "language": "apc",
            "title": entry["title"],
            "link": entry["url"],
            "prompt": "Check this article out and see if you want to learn any of these expressions in Levantin Arabic.",
            "extraInfo": "",
            "isUserCreated": False,
            "lastDownloadedAt": None,
            "isExploited": False,
            "lastIteratedAt": None,
            "nextShownEarliestAt": datetime.now().strftime("%Y-%m-%dT00:00:00Z"),
            "priority": 1,
            "extractedUnits": []
        }
        converted.append(new_entry)
    
    # Write output
    with open("converted_links.json", "w") as f:
        json.dump(converted, f, indent=2)
    
    print(f"Converted {len(converted)} entries")

if __name__ == "__main__":
    convert_links()
