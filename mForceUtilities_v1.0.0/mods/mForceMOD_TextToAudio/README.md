# Audiobook Generation Agent

This agent automates the conversion of the "Influence Design in the AI Era" PDF into a distribution-ready audiobook using Google Cloud Text-to-Speech (Chirp-HD).

## Features

1.  **Smart PDF Extraction**: 
    - Automatically cleans headers and footers using regex tailored to the book's layout.
    - "Smart-chunking" by chapters (FrontMatter, Introduction, Chapters 1-6, References).
2.  **High-Fidelity Synthesis**:
    - Uses Google's `en-US-Chirp3-HD-Charon` model.
    - Generates MP3 audio.
    - Handles text chunking to respect API limits (5000 chars).
3.  **Audio Mastering** (Requires ffmpeg):
    - Normalizes volume to industry standards (target -20dB RMS).
    - Adds room tone (1s beginning, 3s end).
    - Ensures 192kbps quality.

## Setup

1.  **Install System Dependencies**:
    - **FFmpeg**: Required for audio mastering.
      - Mac: `brew install ffmpeg`
      - Windows/Linux: Install from website/package manager.

2.  **Install Python Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Google Cloud Authentication**:
    - Enable 'Cloud Text-to-Speech API' in Google Cloud Console.
    - Create a Service Account and download the JSON key.
    - Set the environment variable:
      ```bash
      export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"
      ```

## Usage

Run the agent script:

```bash
python3 audiobook_agent.py
```

### Output

- **audiobook_output/**: Contains extracted text files and synthesized MP3 files for each chapter.
  - `Chapter_1.txt` / `Chapter_1.mp3`
  - ...

## Customization

- **Regex Logic**: The script `audiobook_agent.py` contains `REGEX_FOOTER_EVEN` and `REGEX_FOOTER_ODD` which are specifically tuned to remove the page numbers and book titles found in the footers of this PDF.
- **Narrator**: Change the `voice` parameters in `synthesize_chapter` function.

## Notes on Packaging

- **Audible/ACX**: Upload generated MP3s chapter-by-chapter.
- **Findaway**: Use the same files.
- **Retail Sample**: Manually cut the first 3-5 minutes of Chapter 1 using a tool like Audacity or `ffmpeg`.

```bash
# Example Retail Sample generation with ffmpeg
ffmpeg -i audiobook_output/Chapter_1.mp3 -t 180 -c copy retail_sample.mp3
```
