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
