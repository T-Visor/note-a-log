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
from markdown_to_plain import strip_markdown


class EmbeddingsManager:
    """
    Manages embeddings for documents stored in Qdrant.
    Provides methods to update and delete document embeddings.
    """
    
    def __init__(self):
        """
            Initializes the embeddings manager with document store and embedding models.
        """
        self.qdrant_document_store = QdrantDocumentStore(**QDRANT_CONFIG)
        self.sparse_text_embedder = FastembedSparseTextEmbedder(
            model=FASTEMBED_SPARSE_MODEL, cache_dir=FASTEMBED_CACHE_DIRECTORY
        )
        self.dense_text_embedder = FastembedTextEmbedder(
            model=FASTEMBED_DENSE_MODEL, cache_dir=FASTEMBED_CACHE_DIRECTORY
        )
        self.document_writer = DocumentWriter(
            document_store=self.qdrant_document_store, policy=DuplicatePolicy.OVERWRITE
        )
    

    def update_embedding(self, document_id: str, new_content: str):
        """
            Updates the embedding for a given document ID by recomputing its embeddings
            using dense and sparse models.
        
        :param document_id: The unique identifier of the document.
        :param new_content: The new text content for which embeddings will be computed.

        :return: The updated document.
        """
        # Retrieve the document
        documents = self.qdrant_document_store.get_documents_by_id([document_id])
        if not documents:
            raise ValueError(f"Document with ID {document_id} not found.")
        
        document = documents[0]
        document.content = strip_markdown(new_content)
        
        # Compute new embeddings
        self.dense_text_embedder.warm_up()
        document.embedding = self.dense_text_embedder.run(document.content)['embedding']
        
        self.sparse_text_embedder.warm_up()
        document.sparse_embedding = self.sparse_text_embedder.run(document.content)['sparse_embedding']
        
        # Write updated document back to the store
        self.document_writer.run([document])
        
        return document


    def delete_embedding(self, document_id: str):
        """
            Deletes the embedding of a given document ID from the document store.
        
        :param document_id: The unique identifier of the document to be deleted.
        """
        self.qdrant_document_store.delete_documents([document_id])
        print(f"Deleted document with ID: {document_id}")


# Example usage:
# updater = EmbeddingsManager()
# updater.update_embedding('bf1d37b33071ea26e170bc3583dce41cddf70305d7356bc6ee3365363e1282de', "Hampton inn complete!")
# updater.delete_embedding('f94e39573a1217ed0e299082a88ff22a4a9bae31a8bc7191855059bd82c35bfc')

