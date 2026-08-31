import sys
import os

# Add parent directory to path to allow importing modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import db_manager
import rag_engine
import shutil
import requests
from dotenv import load_dotenv

load_dotenv()

def test_backend():
    print("Testing DB Manager...")
    # Clean up old DB for testing
    if os.path.exists("investigator.db"):
        os.remove("investigator.db")
    
    db_manager.init_db()
    
    inv_id = db_manager.create_investigation("Test Case", "Test Description")
    print(f"Created Investigation ID: {inv_id}")
    
    invs = db_manager.get_investigations()
    assert len(invs) == 1
    assert invs[0]['name'] == "Test Case"
    print("Investigation retrieval: PASS")
    
    # Create dummy file
    os.makedirs("test_data", exist_ok=True)
    with open("test_data/test.txt", "w") as f:
        f.write("Flux is a powerful agentic AI.")
        
    db_manager.add_source(inv_id, "LOCAL", os.path.abspath("test_data"))
    sources = db_manager.get_sources(inv_id)
    assert len(sources) == 1
    assert sources[0]['path'] == os.path.abspath("test_data")
    print("Source addition: PASS")
    
    print("Testing RAG Engine Compilation...")
    # Check for Google API Key
    if "GOOGLE_API_KEY" not in os.environ:
        print("⚠️ GOOGLE_API_KEY not found in environment variables. Tests may fail.")
    else:
        print("GOOGLE_API_KEY found.")

    print("Attempting compilation...")
    try:
        # Compile Version 1
        res = rag_engine.compile_investigator(inv_id, "v1 - Initial Test")
        print(f"Compilation Result (v1): {res}")
        
        # Verify Version in DB
        versions = db_manager.get_agent_versions(inv_id)
        assert len(versions) == 1
        assert versions[0]['name'] == "v1 - Initial Test"
        print("Agent Versioning: PASS")
        
    except Exception as e:
        print(f"Compilation Failed: {e}")
        
    print("Backend Test Complete.")
    
    # Cleanup
    if os.path.exists("test_data"):
        shutil.rmtree("test_data")
    if os.path.exists("investigator.db"):
        os.remove("investigator.db")

if __name__ == "__main__":
    test_backend()
