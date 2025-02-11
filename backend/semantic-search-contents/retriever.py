from haystack import Pipeline
from haystack_integrations.components.retrievers.qdrant import QdrantHybridRetriever
from haystack_integrations.document_stores.qdrant import QdrantDocumentStore
from haystack_integrations.components.embedders.fastembed import (
    FastembedTextEmbedder,
    FastembedSparseTextEmbedder
)
from config import (
    QDRANT_CONFIG,
    FASTEMBED_DENSE_MODEL,
    FASTEMBED_SPARSE_MODEL
)

class Retriever:
    def __init__(self):
        """
        Initializes the querying pipeline with a hybrid retriever using dense and sparse embeddings.
        """
        # Initialize QdrantDocumentStore using ** unpacking
        self.document_store = QdrantDocumentStore(**QDRANT_CONFIG)

        # Initialize the retrieval pipeline
        self.pipeline = Pipeline()

        # Adding embedding components
        self.pipeline.add_component("sparse_text_embedder", FastembedSparseTextEmbedder(model=FASTEMBED_SPARSE_MODEL))
        self.pipeline.add_component("dense_text_embedder", FastembedTextEmbedder(
            model=FASTEMBED_DENSE_MODEL,
            prefix="Identify the passage most semantically similar to: ")
        )

        # Adding the retriever
        self.pipeline.add_component("retriever", QdrantHybridRetriever(document_store=self.document_store))

        # Connecting components
        self.pipeline.connect("sparse_text_embedder.sparse_embedding", "retriever.query_sparse_embedding")
        self.pipeline.connect("dense_text_embedder.embedding", "retriever.query_embedding")


    def query(self, text: str, top_k: int = 10):
        """
        Runs the retrieval pipeline on a given query.

        :param text: Query text for retrieval.
        :param top_k: Number of top results to return.
        :return: List of retrieved documents.
        """
        results = self.pipeline.run({
            "dense_text_embedder": {"text": text},
            "sparse_text_embedder": {"text": text}
        })

        documents = results["retriever"]["documents"][:top_k]
        return documents


# Example Usage
if __name__ == "__main__":
    retriever = Retriever()

    query_text = "Who supports fastembed?"
    retrieved_docs = retriever.query(query_text)

    print(f"Query: {query_text}")
    for doc in retrieved_docs:
        print(f"Retrieved Document: {doc.content}, Score: {doc.score}")

