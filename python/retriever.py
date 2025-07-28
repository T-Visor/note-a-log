from haystack import Pipeline
from haystack_integrations.components.retrievers.qdrant import QdrantHybridRetriever
from haystack_integrations.document_stores.qdrant import QdrantDocumentStore
from haystack_integrations.components.embedders.fastembed import (
        FastembedTextEmbedder,
        FastembedSparseTextEmbedder
        )
from config import (
        QDRANT_CONFIG,
        QDRANT_TOP_K_RESULTS,
        FASTEMBED_DENSE_MODEL,
        FASTEMBED_SPARSE_MODEL,
        FASTEMBED_CACHE_DIRECTORY
        )


CONTENT_PREVIEW_LIMIT = 100  # Character limit for content preview display


class HybridRetrieverPipeline:
    """
    Encapsulates a Haystack pipeline that uses dense and sparse FastEmbed models
    with a Qdrant backend for hybrid document retrieval.
    """

    def __init__(self):
        """Initialize the document store, hybrid retriever, and pipeline."""
        self.document_store = QdrantDocumentStore(**QDRANT_CONFIG)

        self.hybrid_retriever = QdrantHybridRetriever(
                document_store=self.document_store,
                top_k=QDRANT_TOP_K_RESULTS
                )

        self.pipeline = self._initialize_pipeline()

    def _initialize_pipeline(self) -> Pipeline:
        """
        Set up the Haystack pipeline with dense and sparse embedders and connect them to the hybrid retriever.

        :return: Configured Pipeline instance.
        """
        pipeline = Pipeline()

        # Dense embedder with prompt prefix
        dense_embedder = FastembedTextEmbedder(
                model=FASTEMBED_DENSE_MODEL,
                cache_dir=FASTEMBED_CACHE_DIRECTORY,
                prefix="Identify the passage most semantically similar to: "
                )

        # Sparse embedder
        sparse_embedder = FastembedSparseTextEmbedder(
                model=FASTEMBED_SPARSE_MODEL,
                cache_dir=FASTEMBED_CACHE_DIRECTORY
                )

        # Register components
        pipeline.add_component("dense_text_embedder", dense_embedder)
        pipeline.add_component("sparse_text_embedder", sparse_embedder)
        pipeline.add_component("retriever", self.hybrid_retriever)

        # Connect embedders to the hybrid retriever
        pipeline.connect("dense_text_embedder.embedding", "retriever.query_embedding")
        pipeline.connect("sparse_text_embedder.sparse_embedding", "retriever.query_sparse_embedding")

        return pipeline

    def retrieve_by_query(self, query_text: str):
        """
        Retrieve documents similar to a user-provided query.

        :param query_text: Input query string.
        :return: List of retrieved Document objects.
        """
        result = self.pipeline.run({
            "dense_text_embedder": {"text": query_text},
            "sparse_text_embedder": {"text": query_text}
            })
        return result["retriever"]["documents"]

    def retrieve_similar_to_document(self, doc_id: str):
        """
        Retrieve documents similar to the given document ID, using its dense and sparse embeddings.

        :param doc_id: ID of the reference document.
        :return: List of dictionaries, each containing the ID and similarity score of a similar document (excluding the original).
        """
        documents = self.document_store.get_documents_by_id([doc_id])
        if not documents:
            raise ValueError(f"Document with ID '{doc_id}' not found.")

        reference_doc = documents[0]

        # Ensure embeddings are loaded before retrieval
        _ = reference_doc.embedding
        _ = reference_doc.sparse_embedding

        retrieval_result = self.hybrid_retriever.run(
            query_embedding=reference_doc.embedding,
            query_sparse_embedding=reference_doc.sparse_embedding,
            top_k=QDRANT_TOP_K_RESULTS + 1  # Retrieve extra to account for the reference doc
        )

        retrieved_docs = retrieval_result.get("documents", [])

        if len(retrieved_docs) <= 1:
            raise ValueError(f"No similar documents found for document ID: {doc_id}")

        # Return list of dicts with ID and score, excluding the reference doc
        return [
            {'id': doc.id, 'score': doc.score}
            for doc in retrieved_docs
            if doc.id != doc_id
        ]

if __name__ == "__main__":
    retriever = HybridRetrieverPipeline()

    document_id = "36df8eda42b5ed5069850d432d18ab90c32d207ee5f2b38f06cac76b8dc7e408"
    similar_documents = retriever.retrieve_similar_to_document(document_id)

    for doc_id in similar_documents:
        print(doc_id)
