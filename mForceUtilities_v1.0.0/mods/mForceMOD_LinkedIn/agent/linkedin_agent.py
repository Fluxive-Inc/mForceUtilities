import os
import time
import requests
import json
from typing import TypedDict, List
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# --- CONFIGURATION ---
class Config:
    LINKEDIN_ACCESS_TOKEN = os.getenv("LINKEDIN_ACCESS_TOKEN")
    ORG_URN = os.getenv("LINKEDIN_ORG_URN")  # e.g., "urn:li:organization:123456"
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    CHECK_INTERVAL = 300  # 5 minutes

# --- STATE DEFINITION ---
class SocialState(TypedDict):
    status: str
    new_comments: List[dict]
    drafted_replies: dict
    errors: List[str]

# --- NODE: LISTENER (The Ears) ---
def check_comments(state: SocialState):
    print(f"[{time.strftime('%X')}] 👂 Checking for new comments...")
    
    if not Config.LINKEDIN_ACCESS_TOKEN or not Config.ORG_URN:
        return {"status": "error", "errors": ["Missing Configuration"]}

    # 1. Fetch recent posts (Simplified for demo)
    # In production: GET /v2/ugcPosts?q=authors&authors=List({ORG_URN})
    
    # 2. Fetch comments for those posts
    # For this demo, we mock the finding of a new comment
    mock_new_comment = {
        "id": "urn:li:comment:123",
        "text": "This is a great update! How does the new API handle rate limits?",
        "author": "urn:li:person:MockUser"
    }
    
    # Logic to de-duplicate comments would go here (e.g., check database)
    
    # Simulate finding comments 20% of the time for demo purposes
    import random
    if random.random() > 0.8:
        print(f"   -> Found 1 new comment.")
        return {"status": "drafting", "new_comments": [mock_new_comment], "errors": []}
    
    print("   -> No new comments.")
    return {"status": "sleeping", "new_comments": [], "errors": []}

# --- NODE: WRITER (The Brain) ---
def draft_replies(state: SocialState):
    print(f"[{time.strftime('%X')}] ✍️  Drafting replies...")
    
    if not Config.OPENAI_API_KEY:
        print("   -> Error: No OpenAI API Key found.")
        return {"status": "error", "errors": ["Missing OpenAI Key"]}

    llm = ChatOpenAI(model="gpt-4", temperature=0.7)
    replies = {}
    
    for comment in state["new_comments"]:
        text = comment["text"]
        
        system_prompt = (
            "You are a professional social media manager for a tech company. "
            "Draft a helpful, polite, and concise reply to the following LinkedIn comment."
        )
        
        try:
            response = llm.invoke([
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text}
            ])
            replies[comment["id"]] = response.content
            print(f"   -> Drafted for {comment['id']}: {response.content[:50]}...")
        except Exception as e:
            print(f"   -> LLM Error: {e}")
            return {"status": "error", "errors": [str(e)]}
        
    return {"status": "publishing", "drafted_replies": replies}

# --- NODE: PUBLISHER (The Hands) ---
def publish_replies(state: SocialState):
    print(f"[{time.strftime('%X')}] 🚀 Publishing replies...")
    
    # In a real app, we might save drafts to validMind or a DB first for human approval.
    # For "Safe Mode", we invoke the API.
    
    for comment_id, reply_text in state["drafted_replies"].items():
        # url = f"https://api.linkedin.com/v2/socialActions/{comment_id}/comments"
        # payload = {"message": {"text": reply_text}}
        # response = requests.post(url, json=payload, headers=...)
        
        print(f"   -> [MOCK POST] Replying to {comment_id}:")
        print(f"      '{reply_text}'")
        
    return {"status": "sleeping", "drafted_replies": {}}

# --- GRAPH CONSTRUCTION ---
def build_agent():
    workflow = StateGraph(SocialState)
    
    workflow.add_node("listener", check_comments)
    workflow.add_node("writer", draft_replies)
    workflow.add_node("publisher", publish_replies)

    workflow.set_entry_point("listener")
    
    # Conditional Routing
    def route_step(state):
        if state.get("errors"):
            return END
        if state["status"] == "drafting":
            return "writer"
        elif state["status"] == "publishing":
            return "publisher"
        else:
            return END

    workflow.add_conditional_edges(
        "listener",
        route_step,
        {
            "writer": "writer",
            END: END
        }
    )
    
    workflow.add_edge("writer", "publisher")
    workflow.add_edge("publisher", END)
    
    return workflow.compile()

# --- RUNNER ---
if __name__ == "__main__":
    print("🤖 mForce LinkedIn Agent (Safe Mode) Initializing...")
    agent = build_agent()
    
    # Basic Loop
    try:
        while True:
            inputs = {"status": "starting", "new_comments": [], "drafted_replies": {}, "errors": []}
            result = agent.invoke(inputs)
            
            if result.get("errors"):
                print(f"🛑 Error encountered: {result['errors']}")
                break
                
            print(f"💤 Sleeping for {Config.CHECK_INTERVAL}s...")
            time.sleep(Config.CHECK_INTERVAL)
            
    except KeyboardInterrupt:
        print("👋 Agent shutting down.")
