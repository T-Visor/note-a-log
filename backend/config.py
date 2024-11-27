DATABASE_PATH = '../data/notesApp.db'
DATABASE_TABLE_WITH_NOTES = 'notes'
DATABASE_TABLE_WITH_FOLDERS = 'folders' 

MODEL_NAME = 'llama3.2'

PROMPT_TEMPLATE = """
### Note Categorization

Based on the following title and content from a note and potential existing set of
categories, suggest a concise category name for the note without explanation:

**Title:** {{ title }} (The title of the note)
**Content:** {{ content }} (The content from the note)
**Existing Categories:** [{{ categories | join(', ') }}] (Any relevant pre-existing categories)

**Suggested Category Name:**
"""
