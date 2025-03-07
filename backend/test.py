from haystack.components.writers import DocumentWriter
from haystack_integrations.document_stores.qdrant import QdrantDocumentStore
from haystack.document_stores.types import DuplicatePolicy

from haystack_integrations.components.embedders.fastembed import (
    FastembedTextEmbedder,
    FastembedSparseTextEmbedder
)
from config import (
    QDRANT_CONFIG,
    FASTEMBED_DENSE_MODEL,
    FASTEMBED_SPARSE_MODEL,
    FASTEMBED_CACHE_DIRECTORY
)


QDRANT_DOCUMENT_STORE = QdrantDocumentStore(**QDRANT_CONFIG)
SPARSE_TEXT_EMBEDDER = FastembedSparseTextEmbedder(model=FASTEMBED_SPARSE_MODEL, 
                                                   cache_dir=FASTEMBED_CACHE_DIRECTORY)
DENSE_TEXT_EMBEDDER = FastembedTextEmbedder(model=FASTEMBED_DENSE_MODEL,
                                            cache_dir=FASTEMBED_CACHE_DIRECTORY)
DOCUMENT_WRITER = DocumentWriter(document_store=QDRANT_DOCUMENT_STORE, policy=DuplicatePolicy.OVERWRITE)



document = QDRANT_DOCUMENT_STORE.get_documents_by_id(['80a7f6267f429085cf1c08c2d09c470e3cb483e56ccc0190e1fd7caf61217861'])[0]

document.content = "I've changed!"

DENSE_TEXT_EMBEDDER.warm_up()
document.embedding = DENSE_TEXT_EMBEDDER.run(document.content)['embedding']

SPARSE_TEXT_EMBEDDER.warm_up()
document.sparse_embedding = SPARSE_TEXT_EMBEDDER.run(document.content)['sparse_embedding']

DOCUMENT_WRITER.run([document])
