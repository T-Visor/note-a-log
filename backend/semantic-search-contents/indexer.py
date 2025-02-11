from haystack import Document, Pipeline
from haystack.components.writers import DocumentWriter
from haystack_integrations.document_stores.qdrant import QdrantDocumentStore
from haystack.document_stores.types import DuplicatePolicy
from haystack_integrations.components.embedders.fastembed import (
    FastembedDocumentEmbedder,
    FastembedSparseDocumentEmbedder
)
from config import (
    QDRANT_CONFIG,
    FASTEMBED_DENSE_MODEL,
    FASTEMBED_SPARSE_MODEL
)

class Indexer:
    def __init__(self, embedding_dim: int = 384, 
                 recreate_index: bool = True, 
                 use_sparse_embeddings: bool = True):
        """
        Initializes the Qdrant-based document indexing pipeline.

        :param embedding_dim: Dimension of the embeddings.
        :param recreate_index: Whether to recreate the index.
        :param use_sparse_embeddings: Whether to use sparse embeddings.
        """
        self.document_store = QdrantDocumentStore(**QDRANT_CONFIG)

        self.pipeline = Pipeline()
        self.pipeline.add_component('sparse_doc_embedder', FastembedSparseDocumentEmbedder(model=FASTEMBED_SPARSE_MODEL))
        self.pipeline.add_component('dense_doc_embedder', FastembedDocumentEmbedder(model=FASTEMBED_DENSE_MODEL))
        self.pipeline.add_component('writer', DocumentWriter(document_store=self.document_store, policy=DuplicatePolicy.OVERWRITE))

        self.pipeline.connect('sparse_doc_embedder', 'dense_doc_embedder')
        self.pipeline.connect('dense_doc_embedder', 'writer')

    def index_documents(self, documents: list):
        """
        Indexes a list of documents in the Qdrant document store.

        :param documents: List of `Document` objects to index.
        """
        self.pipeline.run({'sparse_doc_embedder': {'documents': documents}})
        print(f'Indexed {len(documents)} documents successfully.')


if __name__ == '__main__':
    indexer = Indexer()

    documents = [
        Document(content="""Get the following items:
                            5w-30 oil
                            Wix 57002 oil filter
                            Manual transmission fluid 75w80 (GL-4)
                            Oil filter wrench
                            fluid film with gas mask
                            impact gun
                            CAC ID
                         """),
        Document(content='Name: Lumenative (towards a bright future of innovation). Product name: Note-a-log (Amanuensis)'),
        Document(content="""Pasta
Ribs
Chicken and veggies
Fried chicken
"""),
        Document(content="""Strawberries (5)
Cake mix (2 cups)
whipped cream (make sure dairy-free)
"""),
        Document(content="""Considering buying cake mix with gluten-free mixture. I am interested in getting the confetti variant.
"""),
        Document(content="""Follow-up with Hampton Inn for 1 night refund which was promised
Follow-up with Chipotle regarding messed-up order.
"""),
    ]

    indexer.index_documents(documents)

