DATABASE_PATH = '../data/notesApp.db'
DATABASE_TABLE_WITH_NOTES = 'notes'
DATABASE_TABLE_WITH_FOLDERS = 'folders' 

MODEL_NAME = 'llama3.1:8b'

PROMPT_TEMPLATE = """
You are a note categorizer, help me stay organized.

Based on the following title and content from a note and potential existing set of
categories, select or generate a new category without explanation:

Title: {{ title }} 
Content: {{ content }} 
Existing Categories: [{{ categories | join(', ') }}] 

category name:
"""
