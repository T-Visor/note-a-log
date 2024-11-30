from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title='Note-a-log AI Services',
    description='Provides GenAI capabilities for the Note-a-log app.'
)

# CORS Configuration
origins = [
    'http://localhost:3000',
    'http://localhost:3001'
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

@app.get('/')
def root():
    return {'message': 'Welcome to the FastAPI microservice!'}
