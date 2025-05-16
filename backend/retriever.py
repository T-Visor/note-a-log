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
        """
        Initializes the querying pipeline with a hybrid retriever using dense and sparse embeddings.
        """
        # Initialize QdrantDocumentStore using ** unpacking
        self.document_store = QdrantDocumentStore(**QDRANT_CONFIG)

        self.retriever = QdrantHybridRetriever(document_store=self.document_store,
                                               top_k=QDRANT_TOP_K_RESULTS)

        # Initialize the retrieval pipeline
        self.pipeline = Pipeline()

        # Adding embedding components
        self.pipeline.add_component("sparse_text_embedder", FastembedSparseTextEmbedder(
            model=FASTEMBED_SPARSE_MODEL, 
            cache_dir=FASTEMBED_CACHE_DIRECTORY
        ))
        self.pipeline.add_component("dense_text_embedder", FastembedTextEmbedder(
            model=FASTEMBED_DENSE_MODEL,
            cache_dir=FASTEMBED_CACHE_DIRECTORY,
            prefix="Identify the passage most semantically similar to: "
        ))

        # Adding the retriever
        self.pipeline.add_component("retriever", QdrantHybridRetriever(document_store=self.document_store,
                                                                                       top_k=QDRANT_TOP_K_RESULTS))

        # Connecting components
        self.pipeline.connect("sparse_text_embedder.sparse_embedding", "retriever.query_sparse_embedding")
        self.pipeline.connect("dense_text_embedder.embedding", "retriever.query_embedding")


    def query(self, text: str):
        """
        Runs the retrieval pipeline on a given query.

        :param text: Query text for retrieval.
        :return: List of retrieved documents.
        """
        results = self.pipeline.run({
            "dense_text_embedder": {"text": text},
            "sparse_text_embedder": {"text": text}
        })

        documents = results["retriever"]["documents"]
        return documents
    

    def find_similar(self, document_id: str):
        documents = self.document_store.get_documents_by_id([document_id])
        if not documents:
            raise ValueError(f"Document with ID {document_id} not found.")
        
        document = documents[0]
        
        # Compute new embeddings
        document.embedding
        
        document.sparse_embedding
        return self.retriever.run(query_embedding=document.embedding, 
                                  query_sparse_embedding=document.sparse_embedding)


# Example Usage
if __name__ == "__main__":
    retriever = Retriever()

    results = retriever.find_similar("81fd2f70fadb18a395fecc23ae71fa1462fc78c7e201363ff02b07e6723297c9")
    print(results)

    print(len(results['documents']))
