import auto_categorize_notes
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from indexer import Indexer
from retriever import Retriever

EMBEDDING_RETRIEVER = Retriever()
NOTES_INDEXER = Indexer()

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
        raise httpException(status_code=500, detail=f'An error occurred: {str(e)}')

@app.post('/embed_note_contents')
def embed_note_contents(note_title: str, note_contents: str):
    try: 
        embeddings_ID = NOTES_INDEXER.embed_note_information(note_title, note_contents)
        return {"status": "success", "message": embeddings_ID}
    except Exception as e:
        raise httpException(status_code=500, detail=f'An error occurred: {str(e)}')
