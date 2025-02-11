QDRANT_CONFIG = {
    'url': 'http://localhost:6333',
    'index': 'Test',
    'recreate_index': False,  # Prevent overwriting existing data
    'use_sparse_embeddings': True,  # Enable sparse embeddings
    'embedding_dim': 384  # Set embedding dimension
}

FASTEMBED_SPARSE_MODEL = 'prithvida/Splade_PP_en_v1'
FASTEMBED_DENSE_MODEL = 'BAAI/bge-small-en-v1.5'
