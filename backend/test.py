from haystack_integrations.document_stores.qdrant import QdrantDocumentStore
from config import QDRANT_CONFIG
from indexer import Indexer

QDRANT_DOCUMENT_STORE = QdrantDocumentStore(**QDRANT_CONFIG)
INDEXER = Indexer()


document = QDRANT_DOCUMENT_STORE.get_documents_by_id(['80a7f6267f429085cf1c08c2d09c470e3cb483e56ccc0190e1fd7caf61217861'])[0]

document.content = "I've changed!"

QDRANT_DOCUMENT_STORE.write_documents([document])
