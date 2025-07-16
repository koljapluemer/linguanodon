import os
import sys
from pathlib import Path

# Set the .txt file to use
VIDEO_LIST_TXT = "/home/brokkoli/GITHUB/linguanodon/backend/scripts/002_handle_yt_video/apc_ar.txt"  # Change as needed

# Parse language codes from filename
filename = Path(VIDEO_LIST_TXT).stem  # e.g., 'apc_ar'
try:
    TARGET_LANG_CODE, VIDEO_SUBTITLE_LANGUAGE = filename.split("_")
except ValueError:
    print(f"Error: Could not parse language codes from filename '{VIDEO_LIST_TXT}'. Expected format '<target>_<subtitle>.txt'")
    sys.exit(1)

# Import process_video from generate.py
from generate import process_video

# Read video codes from file
with open(VIDEO_LIST_TXT, "r", encoding="utf-8") as f:
    video_ids = [line.strip() for line in f if line.strip()]

data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../data"))
os.makedirs(data_dir, exist_ok=True)

for idx, video_id in enumerate(video_ids):
    output_file = f"youtube_{video_id}.json"
    output_path = os.path.join(data_dir, output_file)
    if os.path.exists(output_path):
        print(f"[{idx+1}/{len(video_ids)}] Skipping video {video_id}: output already exists at {output_path}")
        continue
    print(f"\n[{idx+1}/{len(video_ids)}] Processing video: {video_id}")
    try:
        process_video(video_id, TARGET_LANG_CODE, VIDEO_SUBTITLE_LANGUAGE, output_path)
    except Exception as e:
        print(f"Error processing video {video_id}: {e}\nSKIPPING this video.")
        continue
