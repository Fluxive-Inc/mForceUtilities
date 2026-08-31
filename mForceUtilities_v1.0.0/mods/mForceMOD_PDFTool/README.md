# PDF QA Agent

A simple command-line agent that allows you to ask questions about a PDF document using Google's Gemini models.

## Installation

1.  Clone the repository.
2.  Install the package:
    ```bash
    pip install .
    ```

## Configuration

Create a `.env` file in the directory where you run the tool:

```
GOOGLE_API_KEY=your_api_key_here
```

## Usage

Run the agent via the command line:

```bash
pdf-agent path/to/document.pdf
```

Follow the prompts to ask questions. Type `exit` or `quit` to stop.
