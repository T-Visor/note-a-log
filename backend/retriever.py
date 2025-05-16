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


class Retriever:
    def __init__(self):
        """Initialize the Qdrant retriever pipeline using dense and sparse FastEmbed models."""
        self.document_store = QdrantDocumentStore(**QDRANT_CONFIG)
        self.retriever = QdrantHybridRetriever(
            document_store=self.document_store,
            top_k=QDRANT_TOP_K_RESULTS
        )
        self.pipeline = self._build_pipeline()

    def _build_pipeline(self) -> Pipeline:
        """Build and connect the hybrid retrieval pipeline."""
        pipeline = Pipeline()

        # Add embedders
        dense_embedder = FastembedTextEmbedder(
            model=FASTEMBED_DENSE_MODEL,
            cache_dir=FASTEMBED_CACHE_DIRECTORY,
            prefix="Identify the passage most semantically similar to: "
        )
        sparse_embedder = FastembedSparseTextEmbedder(
            model=FASTEMBED_SPARSE_MODEL,
            cache_dir=FASTEMBED_CACHE_DIRECTORY
        )

        pipeline.add_component("dense_text_embedder", dense_embedder)
        pipeline.add_component("sparse_text_embedder", sparse_embedder)
        pipeline.add_component("retriever", self.retriever)

        # Connect embedding outputs to the hybrid retriever
        pipeline.connect("dense_text_embedder.embedding", "retriever.query_embedding")
        pipeline.connect("sparse_text_embedder.sparse_embedding", "retriever.query_sparse_embedding")

        return pipeline

    def query(self, text: str):
        """
        Query the pipeline with a user-provided text string.

        :param text: Input query string.
        :return: List of retrieved documents.
        """
        results = self.pipeline.run({
            "dense_text_embedder": {"text": text},
            "sparse_text_embedder": {"text": text}
        })
        return results["retriever"]["documents"]

    def find_similar(self, document_id: str):
        """
        Find similar documents based on the embeddings of a known document.

        :param document_id: ID of the document to use as reference.
        :return: Retrieval result with similar documents.
        """
        documents = self.document_store.get_documents_by_id([document_id])
        if not documents:
            raise ValueError(f"Document with ID {document_id} not found.")

        doc = documents[0]

        # Ensure embeddings are computed before passing to retriever
        _ = doc.embedding
        _ = doc.sparse_embedding

        return self.retriever.run(
            query_embedding=doc.embedding,
            query_sparse_embedding=doc.sparse_embedding
        )


if __name__ == "__main__":
    retriever = Retriever()

    results = retriever.find_similar("81fd2f70fadb18a395fecc23ae71fa1462fc78c7e201363ff02b07e6723297c9")
    print(results)
    print(len(results["documents"]))