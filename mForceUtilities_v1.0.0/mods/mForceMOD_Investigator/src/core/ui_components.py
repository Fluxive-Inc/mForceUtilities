import streamlit as st
import pandas as pd
import time
import os
import db_manager
import utils
import rag_engine

def get_css():
    return """
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Orbitron:wght@400;500;700&display=swap');

    :root {
        --primary-color: #06b6d4;  /* Cyan-500 */
        --primary-hover: #0891b2;  /* Cyan-600 */
        --secondary-color: #8b5cf6; /* Violet-500 */
        
        --bg-core: #020617;        /* Slate-950 */
        --bg-panel: #0f172a;       /* Slate-900 */
        --bg-input: #1e293b;       /* Slate-800 */
        
        --text-main: #f8fafc;      /* Slate-50 */
        --text-dim: #94a3b8;       /* Slate-400 */
        
        --glass-border: 1px solid rgba(148, 163, 184, 0.1);
        --neon-glow: 0 0 10px rgba(6, 182, 212, 0.3);
    }

    /* --- Global Reset & Typography --- */
    .stApp {
        background-color: var(--bg-core);
        background-image: 
            radial-gradient(circle at 10% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 25%),
            radial-gradient(circle at 90% 80%, rgba(6, 182, 212, 0.05) 0%, transparent 25%);
        color: var(--text-main);
        font-family: 'Inter', sans-serif;
        font-size: 0.85rem; /* Reduced from default */
    }
    
    h1, h2, h3, h4, h5, h6 {
        font-family: 'Orbitron', sans-serif !important;
        color: var(--text-main) !important;
        letter-spacing: 0.5px;
        font-size: 90% !important; /* Scale down headers */
    }
    
    a { color: var(--primary-color); text-decoration: none; }
    a:hover { text-decoration: underline; }

    /* --- Sidebar --- */
    [data-testid="stSidebar"] {
        background-color: var(--bg-panel);
        border-right: 1px solid rgba(30, 41, 59, 0.5);
    }
    [data-testid="stSidebar"] h1, [data-testid="stSidebar"] h2, [data-testid="stSidebar"] h3 {
        color: var(--primary-color) !important;
    }

    /* --- Inputs (Fixing Visibility) --- */
    /* Target all input types directly */
    .stTextInput input, 
    .stTextArea textarea, 
    .stNumberInput input, 
    .stSelectbox div[data-baseweb="select"] > div {
        background-color: var(--bg-input) !important;
        color: var(--text-main) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-radius: 6px;
        font-size: 0.85rem !important;
    }
    
    /* Focus States */
    .stTextInput input:focus, 
    .stTextArea textarea:focus, 
    .stSelectbox div[data-baseweb="select"] > div:focus-within {
        border-color: var(--primary-color) !important;
        box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.2) !important;
    }
    
    /* Placeholders */
    ::placeholder {
        color: var(--text-dim) !important;
        opacity: 0.7;
    }

    /* --- Buttons --- */
    .stButton button {
        background-color: var(--bg-input);
        border: 1px solid rgba(148, 163, 184, 0.3);
        color: var(--text-main);
        font-weight: 500;
        border-radius: 6px;
        transition: all 0.2s ease;
        font-family: 'Inter', sans-serif;
        font-size: 0.85rem !important;
    }
    .stButton button:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
        background-color: rgba(6, 182, 212, 0.1);
    }
    
    /* Primary Action Buttons */
    .stButton button[kind="primary"] {
        background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
        border: none;
        color: #fff !important;
        font-weight: 600;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .stButton button[kind="primary"]:hover {
        box-shadow: 0 0 15px rgba(6, 182, 212, 0.5);
        transform: translateY(-1px);
    }

    /* --- Tables --- */
    [data-testid="stDataFrame"] {
        border: 1px solid rgba(255,255,255,0.05);
        border-radius: 8px;
        overflow: hidden;
    }
    [data-testid="stDataFrame"] table {
        background-color: transparent !important;
    }
    
    /* --- Tabs --- */
    .stTabs [data-baseweb="tab-list"] {
        gap: 20px;
        border-bottom: 2px solid rgba(255,255,255,0.05);
        padding-bottom: 0px;
    }
    .stTabs [data-baseweb="tab"] {
        height: 45px;
        white-space: pre-wrap;
        background-color: transparent;
        border: none;
        color: var(--text-dim);
        font-family: 'Orbitron', sans-serif;
        font-size: 0.85rem;
    }
    .stTabs [aria-selected="true"] {
        color: var(--primary-color);
        background-color: transparent;
        border-bottom: 2px solid var(--primary-color);
    }

    /* --- Expanders --- */
    .streamlit-expanderHeader {
        background-color: rgba(255, 255, 255, 0.02) !important;
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        color: var(--text-main) !important;
    }
    
    /* --- Chat --- */
    .stChatMessage {
        background-color: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 8px;
    }
    [data-testid="chatAvatarIcon-assistant"] {
        background-color: var(--primary-color);
    }
    
    /* --- Custom Progress Bar (Hijacking stStatusWidget) --- */
    div[data-testid="stStatusWidget"] {
        visibility: hidden;
    }
    div[data-testid="stStatusWidget"] > div {
       visibility: hidden;
    }
    div[data-testid="stStatusWidget"]::after {
        content: "";
        visibility: visible;
        position: fixed;
        top: 0;
        left: 0;
        height: 4px;
        width: 100%;
        background: linear-gradient(90deg, transparent, #06b6d4, transparent);
        background-size: 200% 100%;
        animation: loadingScan 2s linear infinite alternate;
        z-index: 999999;
    }
    @keyframes loadingScan {
        0% { background-position: 100% 0; }
        100% { background-position: -100% 0; }
    }
</style>
"""

@st.dialog("Create New Case")
def create_case_dialog():
    new_inv_name = st.text_input("Case Name", placeholder="Operation Blackbriar")
    new_inv_desc = st.text_area("Description", placeholder="Investigation into anomaly...")
    if st.button("Create Case", type="primary"):
        if new_inv_name:
            new_id = db_manager.create_investigation(new_inv_name, new_inv_desc)
            st.session_state["active_investigation_id"] = new_id
            st.success(f"Case #{new_id} Opened")
            st.rerun()
        else:
            st.error("Case Name is required.")

@st.dialog("Manage Case")
def manage_case_dialog(active_id, current_name, current_desc):
    st.caption(f"Case ID: {active_id}")
    
    with st.form("edit_case_form"):
        edit_name = st.text_input("Name", current_name)
        edit_desc = st.text_area("Description", current_desc)
        
        col_del, col_save = st.columns([1, 1])
        with col_del:
            # We can't put a button inside a form that triggers another action easily without form submission,
            # but for delete we often want a double confirm. 
            # In a dialog, we can just use a separate button outside form or handle it differently.
            # Let's keep it simple: Save is the submit. Delete is separate.
            pass 
        
        submitted = st.form_submit_button("Save Changes", type="primary")
        if submitted:
             db_manager.update_investigation(active_id, edit_name, edit_desc)
             st.rerun()

    st.markdown("---")
    st.warning("Danger Zone")
    if st.button("Delete This Case", type="primary"):
        db_manager.delete_investigation(active_id)
        st.session_state["active_investigation_id"] = None
        st.rerun()

def render_sidebar():
    with st.sidebar:
        st.header("📂 CASE FILES")
        
        # New Investigation Button
        if st.button("➕ New Case", use_container_width=True):
            create_case_dialog()
            
        st.markdown("---")
        
        # List Investigations
        investigations = db_manager.get_investigations()
        
        inv_options = {f"{inv['id']} - {inv['name']}": inv['id'] for inv in investigations}
        
        selected_option = st.selectbox(
            "Select Active Case", 
            list(inv_options.keys()), 
            index=0 if list(inv_options.keys()) else None,
            label_visibility="collapsed"
        )
        
        if selected_option:
            # Check if selection changed to update session state
            if st.session_state["active_investigation_id"] != inv_options[selected_option]:
                st.session_state["active_investigation_id"] = inv_options[selected_option]
        
        # Active Case Details in Sidebar
        if st.session_state["active_investigation_id"]:
            active_id = st.session_state["active_investigation_id"]
            active_inv = next((i for i in investigations if i['id'] == active_id), None)
            
            if active_inv:
                st.info(f"**OPEN:** {active_inv['name']}")
                
                if st.button("⚙️ Manage Case", use_container_width=True):
                    manage_case_dialog(active_id, active_inv['name'], active_inv['description'])
            else:
                 # Case might have been deleted but ID lingers
                 st.session_state["active_investigation_id"] = None
                 st.rerun()
    
        st.markdown("---")
        return investigations

def render_evidence_tab(active_id):
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.markdown("### Known Intelligence")
        sources = db_manager.get_sources(active_id)
        if sources:
            df = pd.DataFrame(sources)
            df = pd.DataFrame(sources)
            df['Select'] = False
            df_display = df[['source_type', 'path', 'last_indexed_at']]
            
            # Selection UI
            selection = st.dataframe(
                df_display, 
                use_container_width=True,
                on_select="rerun",
                selection_mode="multi-row"
            )
            
            selected_indices = selection.selection.rows
            if selected_indices:
                st.error(f"{len(selected_indices)} Items Selected")
                col_del, col_prev = st.columns(2)
                
                with col_del:
                    if st.button("Remove Selected"):
                        for idx in selected_indices:
                             source_id = sources[idx]['id']
                             db_manager.delete_source(source_id)
                        st.rerun()

                with col_prev:
                    if len(selected_indices) == 1:
                        if st.button("Preview / Verify"):
                            idx = selected_indices[0]
                            snippet = rag_engine.preview_source(sources[idx]['source_type'], sources[idx]['path'])
                            st.info(snippet)
                            # Update timestamp if valid
                            if "Error" not in snippet:
                                db_manager.update_source_timestamp(sources[idx]['id'])
        else:
            st.info("No sources logged yet.")

    with col2:
        st.markdown("### Log New Evidence")
        s_type = st.selectbox("Source Type", ["WEB", "LOCAL", "GITHUB"])
        
        s_path = None
        uploaded_files = None
        
        if s_type == "LOCAL":
            input_method = st.radio("Input Method", ["Enter Path", "Upload Files"], horizontal=True, label_visibility="collapsed")
            if input_method == "Enter Path":
                path_key = "path_input_field"

                col_input, col_btn = st.columns([4, 1])
                with col_btn:
                    st.write("") 
                    st.write("")
                    if st.button("📂", help="Select Folder natively"):
                        selected = utils.select_folder_native()
                        if selected:
                            st.session_state[path_key] = selected
                            st.rerun()
                
                with col_input:
                    s_path = st.text_input(
                        "Absolute Directory Path", 
                        placeholder="/Users/username/docs",
                        key=path_key
                    )
                            
            else:
                uploaded_files = st.file_uploader("Drag & Drop Files", accept_multiple_files=True)
        else:
            s_path = st.text_input("URL / Path", placeholder="https://..." if s_type != "LOCAL" else "")

        if st.button("Log Evidence"):
            if s_type == "LOCAL" and uploaded_files:
                timestamp = str(int(time.time()))
                save_dir = os.path.join("evidence_locker", str(active_id), timestamp)
                os.makedirs(save_dir, exist_ok=True)
                
                for uploaded_file in uploaded_files:
                    with open(os.path.join(save_dir, uploaded_file.name), "wb") as f:
                        f.write(uploaded_file.getbuffer())
                
                s_path = os.path.abspath(save_dir)
                st.success(f"Uploaded {len(uploaded_files)} files to secure locker.")

            if s_path:
                db_manager.add_source(active_id, s_type, s_path)
                st.success("Evidence Logged")
                time.sleep(1)
                st.rerun()
            else:
                st.error("Path or Files required")

def render_interrogation_tab(active_id):
    # --- Version Management ---
    st.markdown("### 🤖 Agent Versions")
    
    col_ver_sel, col_ver_new = st.columns([1, 1])
    
    with col_ver_sel:
        versions = db_manager.get_agent_versions(active_id)
        version_options = {f"{v['name']} ({v['created_at']})": v['id'] for v in versions}
        
        selected_version_id = st.selectbox(
            "Select Agent Version",
            options=list(version_options.values()),
            format_func=lambda x: [k for k, v in version_options.items() if v == x][0],
            key="selected_agent_version"
        ) if versions else None
        
        if selected_version_id:
            if st.button("Delete Version"):
                db_manager.delete_agent_version(selected_version_id)
                st.rerun()

    with col_ver_new:
        new_version_name = st.text_input("New Version Name", placeholder="e.g., v1 - Initial Audit")
        if st.button("Compile New Version"):
            if new_version_name:
                with st.status("Flux is compiling a new agent version...", expanded=True) as status:
                    st.write("Loading sources...")
                    result = rag_engine.compile_investigator(active_id, new_version_name)
                    st.write("Indexing...")
                    
                    # Extract version ID if possible (assuming msg format) using regex or just query latest
                    # Since we just created it, it's the latest for this investigation.
                    time.sleep(1) # Wait for commit
                    latest_versions = db_manager.get_agent_versions(active_id)
                    if latest_versions:
                        st.session_state["selected_agent_version"] = latest_versions[0]['id']
                    
                    status.update(label="Compilation Complete!", state="complete", expanded=False)
                    st.success(result)
                    time.sleep(1)
                    st.rerun()
            else:
                st.error("Please enter a name for the new version.")
    
    st.markdown("---")
    
    if not selected_version_id:
        st.info("Please create or select an Agent Version to start interrogating.")
        return

    # Chat Interface
    # If a version is selected, ensure we set it in session state if not set (fixing the disappearing issue)
    if selected_version_id:
         st.session_state["selected_agent_version"] = selected_version_id

    chat_key = f"chat_history_{active_id}_{selected_version_id}"
    if chat_key not in st.session_state:
        st.session_state[chat_key] = []

    for message in st.session_state[chat_key]:
        with st.chat_message(message["role"], avatar="🕵️‍♂️" if message["role"] == "assistant" else "👤"):
            st.markdown(message["content"])

    col_chat_ctrl1, col_chat_ctrl2 = st.columns([1,1])
    with col_chat_ctrl1:
        if st.session_state[chat_key]:
            chat_str = "\\n".join([f"{m['role']}: {m['content']}" for m in st.session_state[chat_key]])
            st.download_button("Export Chat", chat_str, file_name=f"chat_{active_id}_{selected_version_id}.txt")
    with col_chat_ctrl2:
         if st.button("Clear History"):
             st.session_state[chat_key] = []
             st.rerun()

    if prompt := st.chat_input(f"Interrogate Flux (Version: {[k for k, v in version_options.items() if v == selected_version_id][0]})..."):
        st.session_state[chat_key].append({"role": "user", "content": prompt})
        with st.chat_message("user", avatar="👤"):
            st.markdown(prompt)

        chat_engine = rag_engine.get_chat_engine(active_id, selected_version_id)
        if chat_engine:
            with st.chat_message("assistant", avatar="🕵️‍♂️"):
                with st.spinner("Thinking..."):
                    response = chat_engine.chat(prompt)
                    st.markdown(response.response)
                    st.session_state[chat_key].append({"role": "assistant", "content": response.response})
        else:
            st.error("Agent not compiled. Please 'Compile Investigator Agent' first.")

def render_docs_panel():
    st.markdown("""
    ### 📘 Guide

    **Getting Started**
    1. **Deps**: `brew install ffmpeg git`
    2. **Env**: `source .venv/bin/activate`
       - `pip install pydub` (for audio)
       - `pip install openpyxl` (for excel)
    3. **LLM**: configured to use **Gemini 2.0 Flash**.
       - Ensure `GOOGLE_API_KEY` is set in env.

    ---

    **📂 Sources**
    - **WEB**: Enter URL.
    - **GITHUB**: Repo URL.
    - **LOCAL**: 
        - **[📂]**: Native Finder Picker.
        - **Drag & Drop**: Copy files to locker.
    
    *Supported: PDF, DOCX, PPTX, IPYNB, MP3*

    ---

    **🕵️ Agent**
    1. Add Sources.
    2. **Compile Agent**.
    3. Chat / Interrogate.
    """)
