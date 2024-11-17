DATABASE_PATH = '../data/notesApp.db'
DATABASE_TABLE_WITH_NOTES = 'notes'

MODEL_NAME = 'llama3.2'

PROMPT_TEMPLATE = """
Based on the following title and content from a note, suggest a concise category name without an explanation:

title: {note_title}
content: {note_content}

concise category name:
"""

