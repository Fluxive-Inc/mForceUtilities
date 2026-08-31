import os
import shutil
import subprocess

OUTPUT_DIR = "audiobook_output"
PACKAGED_DIR = "final_packaged_audiobook"

# Ensure local ffmpeg is found
os.environ["PATH"] += os.pathsep + os.getcwd()

# Explicit mapping of internal names to Final Filenames
# This ensures perfect ordering and naming conventions
FILE_MAPPING = {
    "Opening_Credits.mp3":   "Opening Credits.mp3",
    "FrontMatter.mp3":       "Front Matter.mp3",
    "Introduction.mp3":      "Introduction.mp3",
    "Chapter_1.mp3":         "Chapter 1 - Crafting Tomorrow.mp3",
    "Chapter_2.mp3":         "Chapter 2 - Analytical Maturity.mp3",
    "Chapter_3.mp3":         "Chapter 3 - Elevating Organizational Intelligence.mp3",
    "Chapter_4.mp3":         "Chapter 4 - Harnessing AIs Invisible Power.mp3",
    "Chapter_5.mp3":         "Chapter 5 - Fluxive Leadership.mp3",
    "Chapter_6.mp3":         "Chapter 6 - The Machineforce Ahead.mp3",
    "References.mp3":        "References.mp3",
    "About_the_Author.mp3":  "About the Author.mp3",
    "Ending_Credits.mp3":    "Ending Credits.mp3"
}

def package_book():
    print("Packaging Audiobook...")
    
    if not os.path.exists(PACKAGED_DIR):
        os.makedirs(PACKAGED_DIR)

    # 1. Copy and Rename Files
    for source_name, dest_name in FILE_MAPPING.items():
        source_path = os.path.join(OUTPUT_DIR, source_name)
        dest_path = os.path.join(PACKAGED_DIR, dest_name)
        
        if os.path.exists(source_path):
            shutil.copy2(source_path, dest_path)
            print(f"  Copied: {source_name} -> {dest_name}")
        else:
            print(f"  Warning: {source_name} not found (agent might still be processing).")

    # 2. Generate Retail Sample (from Chapter 1)
    # Using first 5 minutes (300 seconds)
    print("Generating Retail Sample...")
    chap1_path = os.path.join(PACKAGED_DIR, "Chapter 1 - Crafting Tomorrow.mp3")
    sample_path = os.path.join(PACKAGED_DIR, "Retail_Sample_5min.mp3")
    
    if os.path.exists(chap1_path):
        # Requires ffmpeg
        # ffmpeg -i input -t 300 -c copy output
        # Use abs paths to be safe
        cmd = f"ffmpeg -y -i \"{os.path.abspath(chap1_path)}\" -t 300 -c copy \"{os.path.abspath(sample_path)}\""
        try:
            subprocess.run(cmd, shell=True, check=True, stderr=subprocess.DEVNULL)
            print(f"  Sample Created: {sample_path}")
        except subprocess.CalledProcessError:
            print("  Failed to generate sample (ffmpeg error).")
    else:
        print("  Skipping sample generation (Chapter 1 not found).")

    # 3. Add Cover (Prioritize High-Res/Cleaned)
    cover_candidates = ["cover_cleaned.jpg", "cover_ready_for_upload.jpg", "cover.jpg"]
    final_cover_dst = os.path.join(PACKAGED_DIR, "cover.jpg")
    
    for cand in cover_candidates:
        # Check output dir first, then root
        cand_path = os.path.join(PACKAGED_DIR, cand)
        if not os.path.exists(cand_path):
             cand_path = cand # Check root/cwd
             
        if os.path.exists(cand_path):
            shutil.copy2(cand_path, final_cover_dst)
            print(f"  Included Cover: {cand}")
            break
        
    if os.path.exists("book_description.txt"):
        shutil.copy2("book_description.txt", os.path.join(PACKAGED_DIR, "book_description.txt"))
        print("  Included: book_description.txt")

    print(f"\nPackaging Complete! Files are in: {PACKAGED_DIR}")

if __name__ == "__main__":
    package_book()
