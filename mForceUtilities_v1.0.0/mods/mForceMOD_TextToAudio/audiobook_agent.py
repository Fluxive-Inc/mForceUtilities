import os
import re
import math
from pypdf import PdfReader
from google.cloud import texttospeech
try:
    from pydub import AudioSegment
    PYDUB_AVAILABLE = True
except ImportError:
    print("Warning: pydub not available (likely missing audioop in Python 3.13+). Audio mastering will be disabled.")
    PYDUB_AVAILABLE = False

import shutil

# Configuration
PDF_PATH = "Sean Smith_9781637428146_R1.pdf"
OUTPUT_DIR = "audiobook_output"

# Ensure local ffmpeg is found
os.environ["PATH"] += os.pathsep + os.getcwd()

CHAPTER_TITLES = [
    "Preface",
    "Introduction",
    "Chapter 1",
    "Chapter 2",
    "Chapter 3",
    "Chapter 4",
    "Chapter 5",
    "Chapter 6",
    "About the Author",
    "References"
    # Note: Using strict starts matches. "Chapter 1" will match "Chapter 1 From Business..."
]

# Regex for cleaning
# Matches: "36 INFLUENCE DESIGN IN THE AI ERA" (Even page footer)
REGEX_FOOTER_EVEN = re.compile(r'^\s*\d+\s+INFLUENCE DESIGN IN THE AI ERA\s*$', re.MULTILINE)
# Matches: "ANALYTICAL MATURITY 35" (Odd page footer - Uppercase text + Number)
REGEX_FOOTER_ODD = re.compile(r'^\s*[A-Z\s\W]+\s+\d+\s*$', re.MULTILINE) 
# Note: \W included to capture punctuation if any, though mostly text.

def clean_page_text(text):
    # Remove Even Page Footer
    text = REGEX_FOOTER_EVEN.sub('', text)
    
    # Remove Odd Page Footer (More risky, apply mainly to last lines conceptually, 
    # but regex multiline single match should be okay if pattern is specific enough)
    lines = text.split('\n')
    if lines:
        last_line = lines[-1].strip()
        # Check if last line looks like the odd footer (All CAPS text + Number)
        # We perform a specific check to avoid deleting content.
        # It must end with a number. Content must be uppercase.
        if re.match(r'^[A-Z\s\(\)\:\-]+\s+\d+$', last_line):
             # Double check it is not a normal sentence (usually ends with punctuation .)
             if not last_line.endswith('.'):
                lines = lines[:-1] # Remove it
    
    return '\n'.join(lines)

def extract_chapters(pdf_path, output_dir):
    print(f"Extracting text from {pdf_path}...")
    reader = PdfReader(pdf_path)
    
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    full_text = []
    # Extract all text first, retaining page breaks logic if needed, 
    # but simplest is to iterate and detect chapter headers.
    
    current_chapter_title = "FrontMatter"
    current_chapter_text = []
    
    # We'll create a map of text to chapters
    # Heuristic: If a page starts with a Chapter Title, we switch.
    
    normalized_titles = [t.lower() for t in CHAPTER_TITLES]

    for i, page in enumerate(reader.pages):
        raw_text = page.extract_text()
        text = clean_page_text(raw_text)
        
        # Check for chapter start
        # We look at the first few lines of the page
        lines = text.strip().split('\n')
        first_lines = " ".join(lines[:3]).lower() # Grab first few lines to check content
        
        found_title = None
        for title in CHAPTER_TITLES:
            # Check exact match or start match
            if title.lower() in first_lines:
                # Basic check: title should be near the start
                # Also avoid false positives in TOC
                if i > 10: # Skip TOC pages for chapter detection
                     found_title = title
                     break
        
        if found_title and found_title != current_chapter_title:
            # Save previous chapter

            if current_chapter_text:
                save_chapter(current_chapter_title, current_chapter_text, output_dir)
            
            # Start new chapter
            current_chapter_title = found_title
            current_chapter_text = [text]
            print(f"Found {current_chapter_title} at page {i+1}")
        else:
            # Check if current chapter header is repeated
            if current_chapter_title != "FrontMatter" and text.lstrip().lower().startswith(current_chapter_title.lower()):
                 # Remove the title line
                 lines = text.split('\n')
                 # Heuristic: Remove first line if it matches
                 if lines and current_chapter_title.lower() in lines[0].lower():
                     text = '\n'.join(lines[1:])
            
            current_chapter_text.append(text)
            
    # Save last chapter
    if current_chapter_text:
        save_chapter(current_chapter_title, current_chapter_text, output_dir)

def save_chapter(title, text_list, output_dir):
    safe_title = title.replace(" ", "_").replace(":", "")
    filename = os.path.join(output_dir, f"{safe_title}.txt")
    with open(filename, "w") as f:
        f.write("\n".join(text_list))
    print(f"Saved {filename}")

def clean_text_for_tts(text):
    """
    Polishes text for better TTS:
    1. Joins hyphenated words at line endings (e.g. 'auto-\\nmatic' -> 'automatic')
    2. Replaces special layout characters
    3. Normalizes 'Fluxive' or other tricky words if needed
    """
    # 1. Join hyphenated words
    # matches: word- at end of line, followed by word on next line
    text = re.sub(r'(\w+)-\n(\w+)', r'\1\2', text)
    
    # 2. Join lines that are not double-spaced (simple reflow)
    # This helps avoid awkward pauses at every line break in the PDF
    paragraphs = text.split('\n\n')
    cleaned_paragraphs = []
    for p in paragraphs:
        # replace single newlines with spaces
        p = p.replace('\n', ' ')
        # remove multiple spaces
        p = re.sub(r'\s+', ' ', p).strip()
        cleaned_paragraphs.append(p)
        
    text = '\n\n'.join(cleaned_paragraphs)
    
    # 3. Pronunciation replacements
    text = text.replace("Fluxive", "Flux-ive") 
    
    return text

def synthesize_text_chunk(text_chunk, client, voice_params, audio_config):
    synthesis_input = texttospeech.SynthesisInput(text=text_chunk)
    response = client.synthesize_speech(
        input=synthesis_input, voice=voice_params, audio_config=audio_config
    )
    return response.audio_content

def smart_chunk_text(text, max_chars=4800):
    """
    Splits text into chunks ensuring no split happens mid-sentence.
    Prioritizes splitting at double newlines (paragraphs), then single newlines, then periods.
    """
    chunks = []
    current_chunk = ""
    
    # Pre-split by paragraphs to preserve structure
    paragraphs = text.split('\n\n')
    
    for paragraph in paragraphs:
        # If adding this paragraph keeps us under limit, add it
        if len(current_chunk) + len(paragraph) + 2 < max_chars:
            current_chunk += paragraph + "\n\n"
        else:
            # Paragraph is too big or current chunk is full
            # If current chunk has content, save it
            if current_chunk:
                chunks.append(current_chunk)
                current_chunk = ""
            
            # If the paragraph itself is larger than max_chars, we need to split it by sentences
            if len(paragraph) > max_chars:
                sentences = re.split(r'(?<=[.!?])\s+', paragraph)
                for sentence in sentences:
                    if len(current_chunk) + len(sentence) + 1 < max_chars:
                        current_chunk += sentence + " "
                    else:
                        if current_chunk:
                            chunks.append(current_chunk)
                        current_chunk = sentence + " "
                current_chunk += "\n\n" # restore paragraph spacing at end of split paragraph
            else:
                current_chunk += paragraph + "\n\n"
    
    if current_chunk:
        chunks.append(current_chunk)
        
    return chunks

def synthesize_chapter(chapter_file, output_audio_path):
    # Check if already exists AND is mastered (skip if so file size > 1MB)
    if os.path.exists(output_audio_path) and os.path.getsize(output_audio_path) > 1000000:
         print(f"Skipping {output_audio_path} (Already exists)")
         return

    # Check credentials - Allow ADC by just warning if not set, but letting the client try
    if not os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"):
        print("Note: GOOGLE_APPLICATION_CREDENTIALS not set. Attempting to use Application Default Credentials (ADC)...")

    print(f"Synthesizing {chapter_file}...")
    try:
        client = texttospeech.TextToSpeechClient()
    except Exception as e:
        print(f"Failed to create TTS client: {e}")
        return

    voice = texttospeech.VoiceSelectionParams(
        language_code="en-US",
        name="en-US-Chirp3-HD-Charon"
    )
    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3,
        effects_profile_id=['audiobook-class-filtering']
    )

    with open(chapter_file, 'r') as f:
        text = f.read()

    # Pre-process text to remove hyphens and clean up layout
    text = clean_text_for_tts(text)

    # Smart Chunking
    chunks = smart_chunk_text(text, max_chars=4800)
    
    # Store chunk filenames
    chunk_files = []
    base_name = os.path.splitext(os.path.basename(output_audio_path))[0]
    temp_dir = os.path.join(os.path.dirname(output_audio_path), f"temp_{base_name}")
    
    if not os.path.exists(temp_dir):
        os.makedirs(temp_dir)

    for i, chunk in enumerate(chunks):
        if not chunk.strip(): continue
        print(f"  Processing chunk {i+1}/{len(chunks)}")
        try:
            audio_content = synthesize_text_chunk(chunk, client, voice, audio_config)
            chunk_name = os.path.join(temp_dir, f"chunk_{i:03d}.mp3")
            with open(chunk_name, "wb") as out:
                out.write(audio_content)
            chunk_files.append(chunk_name)
        except Exception as e:
            print(f"Error synthesizing chunk {i}: {e}")
    
    # Master audio using ffmpeg directly (Avoids pydub/audioop Python 3.13 issues)
    if chunk_files:
        ffmpeg_master_chapter(chunk_files, output_audio_path, temp_dir)
    
    # Cleanup temp dir
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)

def ffmpeg_master_chapter(chunk_files, output_path, temp_dir):
    """
    Concatenates chunks, adds silence, and normalizes using ffmpeg subprocess.
    """
    import subprocess
    
    # Resolve absolute paths
    chunk_files = [os.path.abspath(f) for f in chunk_files]
    output_path = os.path.abspath(output_path)
    temp_dir = os.path.abspath(temp_dir)
    
    if not shutil.which('ffmpeg'):
        # Fallback if somehow still not found (though provided locally)
        local_ffmpeg = os.path.abspath("./ffmpeg")
        if os.path.exists(local_ffmpeg):
             ffmpeg_cmd = local_ffmpeg
        else:
            print("FFmpeg not found. Just concatenating without mastering.")
            with open(output_path, "wb") as outfile:
                for f in chunk_files:
                    with open(f, "rb") as infile:
                        outfile.write(infile.read())
            return
    else:
        ffmpeg_cmd = "ffmpeg"

    print(f"Mastering to {output_path}...")
    
    # 1. Create concat list with Absolute Paths
    concat_list_path = os.path.join(temp_dir, "concat_list.txt")
    with open(concat_list_path, "w") as f:
        for chunk in chunk_files:
            f.write(f"file '{chunk}'\n")
            
    # 2. Concatenate and Normalize (Loudnorm)
    # Generate 1s silence
    silence_start = os.path.join(temp_dir, "silence_start.mp3")
    silence_end = os.path.join(temp_dir, "silence_end.mp3")
    
    # Use -y to overwrite; explicitly format as mp3
    subprocess.run(f"{ffmpeg_cmd} -y -f lavfi -i anullsrc=r=24000:cl=mono -t 1 -q:a 9 \"{silence_start}\"", shell=True, stderr=subprocess.DEVNULL)
    subprocess.run(f"{ffmpeg_cmd} -y -f lavfi -i anullsrc=r=24000:cl=mono -t 3 -q:a 9 \"{silence_end}\"", shell=True, stderr=subprocess.DEVNULL)
    
    # Re-write concat list with silence (All absolute paths)
    with open(concat_list_path, "w") as f:
        f.write(f"file '{silence_start}'\n")
        for chunk in chunk_files:
             f.write(f"file '{chunk}'\n")
        f.write(f"file '{silence_end}'\n")
        
    # 3. Process
    # -safe 0 is REQUIRED for absolute paths in concat list
    # Add metadata tags
    chapter_title = os.path.basename(output_path).replace(".mp3", "").replace("_", " ")
    cmd = (
        f"{ffmpeg_cmd} -y -f concat -safe 0 -i \"{concat_list_path}\" "
        f"-af loudnorm=I=-20:TP=-3:LRA=11 "
        f"-c:a libmp3lame -b:a 192k -ar 44100 "
        f"-metadata title=\"{chapter_title}\" "
        f"-metadata artist=\"Sean Smith\" "
        f"-metadata album=\"Influence Design in the AI Era\" "
        f"\"{output_path}\""
    )
    
    try:
        # Run without changing CWD, using full paths
        subprocess.run(cmd, shell=True, check=True, stderr=subprocess.PIPE)
        print("  Mastering complete.")
    except subprocess.CalledProcessError as e:
        print(f"  Mastering failed: {e.stderr.decode()}")

def main():
    # Phase 1: PDF Extraction
    extract_chapters(PDF_PATH, OUTPUT_DIR)
    
    # Phase 2: Synthesis & Mastering
    # Iterate over generated text files
    for root, dirs, files in os.walk(OUTPUT_DIR):
        for file in sorted(files):
            if file.endswith(".txt"):
                txt_path = os.path.join(root, file)
                mp3_path = txt_path.replace(".txt", ".mp3")
                synthesize_chapter(txt_path, mp3_path)

    # Phase 3: Packaging
    try:
        import package_book
        package_book.package_book()
    except ImportError:
        print("Packaging script not found. Run package_book.py manually.")

if __name__ == "__main__":
    main()
