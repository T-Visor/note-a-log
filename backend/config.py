DATABASE_PATH = '../data/notesApp.db'
DATABASE_TABLE_WITH_NOTES = 'notes'
DATABASE_TABLE_WITH_FOLDERS = 'folders' 

MODEL_NAME = 'llama3.1:8b-instruct-q3_K_S'

PROMPT_TEMPLATE = """
You are a note categorizer. Help me organize my notes by selecting a category based on the title and content.

Use these guidelines:

Choose an existing category from the list if it fits.
If none of the existing categories fit, generate a new one. Make sure the new category is brief and clear.
Provide only the category name — no explanation.
Title: {{ title }}
Content: {{ content }}
Existing Categories: [{{ categories | join(', ') }}]

Category:
"""
