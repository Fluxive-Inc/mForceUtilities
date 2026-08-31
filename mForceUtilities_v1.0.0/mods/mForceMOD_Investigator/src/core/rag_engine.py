import os
import shutil
import subprocess
from typing import List, Optional
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, StorageContext, load_index_from_storage, Settings, Document
from llama_index.readers.web import SimpleWebPageReader

# Github reader import wrapped in try/except for robustness
try:
    from llama_index.readers.github import GithubRepositoryReader, GithubClient
except ImportError:
    GithubRepositoryReader = None

from llama_index.llms.gemini import Gemini
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
import db_manager
from dotenv import load_dotenv

load_dotenv()

# Setup LlamaIndex Settings
# Ensure GOOGLE_API_KEY is set in environment variables
# Using gemini-2.0-flash as it is available for this account
api_key = os.getenv("GOOGLE_API_KEY")
Settings.llm = Gemini(model="models/gemini-2.0-flash", api_key=api_key)
# Use Local Embeddings (HuggingFace) to run locally without API limits
Settings.embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-small-en-v1.5")

INDEX_STORAGE_DIR = "./storage"

def get_index_path(investigation_id: int, version_id: int) -> str:
    path = os.path.join(INDEX_STORAGE_DIR, str(investigation_id), str(version_id))
    return path

def compile_investigator(investigation_id: int, version_name: str):
    """
    Fetches sources from DB, loads documents, builds/updates index.
    Creates a NEW Agent Version.
    """
    sources = db_manager.get_sources(investigation_id)
    documents = []
    
    report = []
    
    for source in sources:
        sType = source['source_type']
        path = source['path']
        
        try:
            if sType == "LOCAL":
                if os.path.exists(path):
                    reader = SimpleDirectoryReader(input_dir=path, recursive=True)
                    docs = reader.load_data()
                    documents.extend(docs)
                    report.append(f"✅ Loaded {len(docs)} docs from {path}")
                else:
                    report.append(f"❌ Path Not Found: {path}")
            
            elif sType == "WEB":
                reader = SimpleWebPageReader(html_to_text=True)
                docs = reader.load_data([path])
                documents.extend(docs)
                report.append(f"✅ Loaded {len(docs)} pages from {path}")
                
            elif sType == "GITHUB":
                 temp_dir = f"temp_repos/{investigation_id}_{source['id']}"
                 if os.path.exists(temp_dir):
                     shutil.rmtree(temp_dir)
                 
                 subprocess.run(["git", "clone", path, temp_dir], check=True)
                 reader = SimpleDirectoryReader(input_dir=temp_dir, recursive=True)
                 docs = reader.load_data()
                 documents.extend(docs)
                 report.append(f"✅ Cloned & Loaded {len(docs)} files from {path}")
                 shutil.rmtree(temp_dir)

        except Exception as e:
            report.append(f"❌ Error loading {sType} {path}: {str(e)}")
            continue

    if not documents:
        return "\n".join(report) + "\n\n⚠️ No valid documents found to index."

    # Create/Overwrite index
    # Create Agent Version in DB
    version_id = db_manager.create_agent_version(investigation_id, version_name)

    # Create/Overwrite index for this version
    persist_dir = get_index_path(investigation_id, version_id)
    if not os.path.exists(persist_dir):
        os.makedirs(persist_dir)

    index = VectorStoreIndex.from_documents(documents)
    index.storage_context.persist(persist_dir=persist_dir)
    
    return f"Successfully compiled version '{version_name}' (ID: {version_id}). Indexed {len(documents)} documents.\n\n" + "\n".join(report)

def get_chat_engine(investigation_id: int, version_id: int):
    persist_dir = get_index_path(investigation_id, version_id)
    if not os.path.exists(persist_dir):
        return None
        
    storage_context = StorageContext.from_defaults(persist_dir=persist_dir)
    index = load_index_from_storage(storage_context)
    
    # Load system prompt from directives
    directive_path = "directives/investigator_persona.md"
    if os.path.exists(directive_path):
        with open(directive_path, "r") as f:
            system_prompt = f.read()
    else:
        # Fallback if file missing
        system_prompt = (
            "You are FLUX, the Investigator. "
            "You are analyzing the gathered evidence for this Case. "
            "Cross-reference all sources. Be sharp, technical, and concise."
        )

    return index.as_chat_engine(
        chat_mode="context",
        system_prompt=system_prompt
    )

def preview_source(source_type: str, path: str) -> str:
    """Returns a snippet of the source content for preview."""
    try:
        if source_type == "LOCAL":
            if os.path.isdir(path):
                return f"Directory: {path}\nContains {len(os.listdir(path))} files."
            elif os.path.exists(path):
                # Try reading as text first
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        return f.read(500) + "..."
                except UnicodeDecodeError:
                    return f"Binary file: {path} (Preview not available)"
        elif source_type == "WEB":
             return f"Web URL: {path}\nPreview requires live fetch (not implemented for safety)."
        return f"Preview not available for {source_type}"
    except Exception as e:
        return f"Error previewing source: {str(e)}"
