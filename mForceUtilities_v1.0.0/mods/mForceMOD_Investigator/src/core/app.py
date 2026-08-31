import streamlit as st
import db_manager
import ui_components
from dotenv import load_dotenv

load_dotenv()

# --- P A G E   C O N F I G ---
st.set_page_config(
    page_title="Flux Investigator",
    page_icon="🕵️‍♂️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# --- C S S   S T Y L I N G ---
st.markdown(ui_components.get_css(), unsafe_allow_html=True)

# --- I N I T ---
if "db_init" not in st.session_state:
    db_manager.init_db()
    st.session_state["db_init"] = True

if "active_investigation_id" not in st.session_state:
    st.session_state["active_investigation_id"] = None

if "show_docs" not in st.session_state:
    st.session_state["show_docs"] = False

# --- T O P   N A V ---
t_col1, t_col2 = st.columns([6, 1])
with t_col1:
    st.title("FLUX INVESTIGATOR_MODULE")
with t_col2:
    if st.button("📘 Docs", help="Toggle Documentation Panel"):
        st.session_state["show_docs"] = not st.session_state["show_docs"]
        st.rerun()

# --- L A Y O U T   L O G I C ---
if st.session_state["show_docs"]:
    main_col, docs_col = st.columns([3, 1])
else:
    main_col = st.container()
    docs_col = None

# --- S I D E B A R ---
investigations = ui_components.render_sidebar()

# --- M A I N   P A N E L   C O N T E N T ---
with main_col:
    if not st.session_state["active_investigation_id"]:
        st.warning("No Active Investigation Selected. Please Create or Select a Case from the Sidebar.")
    else:
        active_id = st.session_state["active_investigation_id"]
        active_inv = next((i for i in investigations if i['id'] == active_id), None)
        
        st.subheader(f"Case: {active_inv['name']}")
        st.caption(active_inv['description'])
        
        tab1, tab2 = st.tabs(["🔎 EVIDENCE BOARD", "🕵️ INTERROGATION ROOM"])
        
        # --- T A B  1 :  E V I D E N C E ---
        with tab1:
            ui_components.render_evidence_tab(active_id)

        # --- T A B  2 :  I N T E R R O G A T I O N ---
        with tab2:
            ui_components.render_interrogation_tab(active_id)

# --- R I G H T   D O C S   P A N E L ---
if docs_col:
    with docs_col:
        ui_components.render_docs_panel()
