# Database 
DATABASE_PATH = '../data/notesApp.db'
DATABASE_TABLE_WITH_NOTES = 'notes'
DATABASE_TABLE_WITH_FOLDERS = 'folders' 

# Embeddings Database
QDRANT_CONFIG = {
    'url': 'http://localhost:6333',
    'index': 'Test',
    'recreate_index': False,  # Prevent overwriting existing data
    'use_sparse_embeddings': True,  # Enable sparse embeddings
    'embedding_dim': 768  # Set embedding dimension
}
QDRANT_TOP_K_RESULTS = 3
FASTEMBED_SPARSE_MODEL = 'prithvida/Splade_PP_en_v1'
FASTEMBED_DENSE_MODEL = 'BAAI/bge-base-en-v1.5'
FASTEMBED_CACHE_DIRECTORY = './models'
METADATA_FIELDS_TO_EMBED = ['folder', 'title']

# Language model
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
PROMPT_TEMPLATE_WITH_SEMANTIC_SEARCH_RESULTS = """
You are a content categorizer. Help me organize content by selecting the most appropriate category.

Content to categorize:
Title: {{ title }}
Content: {{ content }}

Most similar existing content:
{% for result in search_results %}
- Similar item ({{ result.score|round(2) }}): Category "{{ result.meta.folder }}", Content: "{{ result.content|truncate(80) }}"
{% endfor %}

Existing Categories: [{{ categories | join(', ') }}]

Instructions:
1. Choose an existing category if it fits well
2. Create a new category only if necessary (keep it brief)
3. Return ONLY the category name without explanation

Category:
"""
