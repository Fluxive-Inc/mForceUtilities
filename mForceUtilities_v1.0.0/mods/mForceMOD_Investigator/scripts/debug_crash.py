
import sys
print(f"Python executable: {sys.executable}")
print(f"Python version: {sys.version}")

print("Importing torch...")
import torch
print(f"Torch version: {torch.__version__}")
print("Checking MPS availability...")
print(f"MPS built: {torch.backends.mps.is_built()}")
print(f"MPS available: {torch.backends.mps.is_available()}")

print("Importing llama_index...")
import llama_index
print("Importing llama_index.llms.gemini...")
try:
    from llama_index.llms.gemini import Gemini
    print("Gemini imported.")
except Exception as e:
    print(f"Gemini import failed: {e}")

print("Importing huggingface embeddings...")
try:
    from llama_index.embeddings.huggingface import HuggingFaceEmbedding
    print("HuggingFaceEmbedding imported.")
    print("Initializing Embedding model (this might crash if memory/MPS issues)...")
    embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-small-en-v1.5")
    print("Embedding model initialized.")
except Exception as e:
    print(f"Embedding failed: {e}")

print("Diagnostics passed.")
