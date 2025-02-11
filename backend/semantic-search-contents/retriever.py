from haystack import Pipeline
from haystack_integrations.components.retrievers.qdrant import QdrantHybridRetriever
from haystack_integrations.document_stores.qdrant import QdrantDocumentStore
from haystack_integrations.components.embedders.fastembed import (
    FastembedTextEmbedder,
    FastembedSparseTextEmbedder
)

class Retriever:
    def __init__(self, document_store: QdrantDocumentStore):
        """
        Initializes the querying pipeline with a hybrid retriever using dense and sparse embeddings.

        :param document_store: The QdrantDocumentStore instance to use for retrieval.
        """
        self.document_store = document_store
        self.pipeline = Pipeline()

        # Adding embedding components
        self.pipeline.add_component('sparse_text_embedder', FastembedSparseTextEmbedder(model='prithvida/Splade_PP_en_v1'))
        self.pipeline.add_component('dense_text_embedder', FastembedTextEmbedder(
            model='BAAI/bge-small-en-v1.5',
            prefix='Identify the passage most semantically similar to: ')
        )

        # Adding the retriever
        self.pipeline.add_component('retriever', QdrantHybridRetriever(document_store=self.document_store))

        # Connecting components
        self.pipeline.connect('sparse_text_embedder.sparse_embedding', 'retriever.query_sparse_embedding')
        self.pipeline.connect('dense_text_embedder.embedding', 'retriever.query_embedding')

    def query(self, text: str, top_k: int = 1):
        """
        Runs the retrieval pipeline on a given query.

        :param text: Query text for retrieval.
        :param top_k: Number of top results to return.
        :return: List of retrieved documents.
        """
        results = self.pipeline.run({
            'dense_text_embedder': {'text': text},
            'sparse_text_embedder': {'text': text}
        })

        documents = results['retriever']['documents'][:top_k]
        return documents

# Example Usage
if __name__ == '__main__':
    # Assuming document_store is already initialized in the indexing process
    from haystack_integrations.document_stores.qdrant import QdrantDocumentStore
    
    # Initialize document store (should be shared with the indexing pipeline)
    document_store = QdrantDocumentStore(':memory:', recreate_index=False, use_sparse_embeddings=True, embedding_dim=384)

    retriever = Retriever(document_store)

    query_text = 'Who supports fastembed?'
    retrieved_docs = retriever.query(query_text)

    print(f'Query: {query_text}')
    for doc in retrieved_docs:
        print(f'Retrieved Document: {doc.content}, Score: {doc.score}')

