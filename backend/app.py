import auto_categorize_notes
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from indexer import Indexer
from retriever import Retriever
from haystack_integrations.document_stores.qdrant import QdrantDocumentStore
from config import QDRANT_CONFIG

EMBEDDING_RETRIEVER = Retriever()
NOTES_INDEXER = Indexer()
QDRANT_DOCUMENT_STORE = QdrantDocumentStore(**QDRANT_CONFIG)

app = FastAPI(
    title='Note-a-log AI Services',
    description='Provides GenAI capabilities for the Note-a-log app.',
)

# CORS Configuration
origins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://0.0.0.0:3000'
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

@app.get('/auto_categorize_notes')
def auto_categorize():
    """
        Calls the auto_categorize_notes script and handles exceptions.

        Returns a status message indicating success or failure.
    """
    try:
        auto_categorize_notes.main()
        return {"status": "success", "message": "Notes categorized successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'An error occurred: {str(e)}')

@app.post('/create_initial_note_embeddings')
def create_initial_note_embeddings(note_title: str, note_contents: str):
    try: 
        embeddings_ID = NOTES_INDEXER.embed_note_information(note_title, note_contents)
        return {"status": "success", "message": embeddings_ID}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'An error occurred: {str(e)}')

@app.post('/update_note_embeddings')
def update_note_embeddings(embeddings_ID: str, note_title: str, note_contents: str):
    try: 
        embeddings_ID = NOTES_INDEXER.embed_note_information(note_title, note_contents)
        return {"status": "success", "message": embeddings_ID}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'An error occurred: {str(e)}')

@app.get('get_document')
def get_document(embeddings_ID: str):
    document = QDRANT_DOCUMENT_STORE.get_documents_by_id([embeddings_ID])
    return {"status": "success", "message": document}
