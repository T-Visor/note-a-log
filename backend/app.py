import auto_categorize_notes
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title='Note-a-log AI Services',
    description='Provides GenAI capabilities for the Note-a-log app.',
)

# CORS Configuration
origins = [
    'http://localhost:3000',
    'http://localhost:3001',
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

