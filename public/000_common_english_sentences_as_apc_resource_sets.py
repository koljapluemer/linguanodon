#!/usr/bin/env python3
import json
import os

def create_common_english_resource_set():
    # Read the input file from data_in/links.json (like the inspo script)
    with open("data_in/links.json", "r") as f:
        data = json.load(f)
    
    # Convert each entry to RemoteResource format
    resources = []
    for i, entry in enumerate(data, 1):
        resource = {
            "language": "apc",
            "priority": i,
            "title": entry["title"],
            "prompt": f"Check out this resource about '{entry['title']}' and learn useful English expressions for this topic.",
            "link": {
                "label": entry["title"],
                "url": entry["url"]
            }
        }
        resources.append(resource)
    
    # Create RemoteResourceSet
    resource_set = {
        "name": "Common English Sentences",
        "resources": resources
    }
    
    # Ensure directory exists
    os.makedirs("resource_sets/apc", exist_ok=True)
    
    # Write the resource set
    with open("resource_sets/apc/Common English Sentences.json", "w") as f:
        json.dump(resource_set, f, indent=2)
    
    # Create/update index.json
    index_file = "resource_sets/apc/index.json"
    if os.path.exists(index_file):
        with open(index_file, "r") as f:
            index = json.load(f)
    else:
        index = []
    
    # Add to index if not already present
    resource_name = "Common English Sentences"
    if resource_name not in index:
        index.append(resource_name)
    
    # Write updated index
    with open(index_file, "w") as f:
        json.dump(index, f, indent=2)
    
    print(f"Created resource set '{resource_name}' with {len(resources)} resources")
    print(f"Updated index.json with {len(index)} total resource sets")

if __name__ == "__main__":
    create_common_english_resource_set()