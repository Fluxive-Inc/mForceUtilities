import os
import sys
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_community.vectorstores import FAISS
from langchain_classic.chains import RetrievalQA

# Load environment variables
load_dotenv()

def ingest_pdf(pdf_path):
    """Loads a PDF, splits it into chunks, and creates a vector store."""
    if not os.path.exists(pdf_path):
        print(f"Error: File not found at {pdf_path}")
        return None

    print(f"Loading PDF: {pdf_path}...")
    loader = PyPDFLoader(pdf_path)
    documents = loader.load()
    
    print(f"Splitting {len(documents)} pages into chunks...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    texts = text_splitter.split_documents(documents)
    print(f"Created {len(texts)} chunks.")

    print("Creating vector store...")
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    vectorstore = FAISS.from_documents(texts, embeddings)
    return vectorstore

def main():
    if not os.getenv("GOOGLE_API_KEY"):
        print("Error: GOOGLE_API_KEY not found in environment variables.")
        print("Please create a .env file with your API key.")
        return

    if len(sys.argv) > 1:
        pdf_path = sys.argv[1]
    else:
        pdf_path = input("Enter the path to the PDF file: ")

    vectorstore = ingest_pdf(pdf_path)
    if not vectorstore:
        return

    print("\nSetup complete! You can now ask questions about the PDF.")
    print("Type 'exit' or 'quit' to stop.\n")

    qa_chain = RetrievalQA.from_chain_type(
        llm=ChatGoogleGenerativeAI(model="gemini-2.5-flash"),
        chain_type="stuff",
        retriever=vectorstore.as_retriever()
    )

    while True:
        query = input("Question: ")
        if query.lower() in ['exit', 'quit']:
            break
        
        try:
            response = qa_chain.invoke(query)
            print(f"Answer: {response['result']}\n")
        except Exception as e:
            print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()
