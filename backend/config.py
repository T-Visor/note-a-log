DATABASE_PATH = '../data/notesApp.db'
DATABASE_TABLE_WITH_NOTES = 'notes'

MODEL_NAME = 'llama3.2'

PROMPT_TEMPLATE = """
Based on the following title and content from a note and potential existing set of
categories, suggest a concise category name for the note without explanation:

title: {{ title }}
content: {{ content }}
categories: {{ categories | join(', ') }}

concise category name:
"""
