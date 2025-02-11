from haystack import Document, Pipeline
from haystack.components.writers import DocumentWriter
from haystack_integrations.components.retrievers.qdrant import QdrantHybridRetriever
from haystack_integrations.document_stores.qdrant import QdrantDocumentStore
from haystack.document_stores.types import DuplicatePolicy
from haystack_integrations.components.embedders.fastembed import (
    FastembedTextEmbedder,
    FastembedDocumentEmbedder,
    FastembedSparseTextEmbedder,
    FastembedSparseDocumentEmbedder
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
        self.document_store = QdrantDocumentStore(
            ':memory:',
            recreate_index=recreate_index,
            use_sparse_embeddings=use_sparse_embeddings,
            embedding_dim=embedding_dim
        )

        self.pipeline = Pipeline()
        self.pipeline.add_component('sparse_doc_embedder', FastembedSparseDocumentEmbedder(model='prithvida/Splade_PP_en_v1'))
        self.pipeline.add_component('dense_doc_embedder', FastembedDocumentEmbedder(model='BAAI/bge-small-en-v1.5'))
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
        Document(content='My name is Wolfgang and I live in Berlin'),
        Document(content='I saw a black horse running'),
        Document(content='Germany has many big cities'),
        Document(content='fastembed is supported by and maintained by Qdrant.'),
    ]

    indexer.index_documents(documents)

