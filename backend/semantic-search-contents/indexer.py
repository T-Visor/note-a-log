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
        FASTEMBED_SPARSE_MODEL,
        FASTEMBED_CACHE_DIRECTORY,
        METADATA_FIELDS_TO_EMBED
        )

PIPELINE = {
    "SPARSE_EMBEDDER": "sparse_document_embedder",
    "DENSE_EMBEDDER": "dense_document_embedder",
    "DOCUMENT_WRITER": "document_writer"
}

class Indexer:
    def __init__(self):
        """
        Initializes the a vector database indexing pipeline using Qdrant.

        :param embedding_dim: Dimension of the embeddings.
        :param recreate_index: Whether to recreate the index.
        :param use_sparse_embeddings: Whether to use sparse embeddings.
        """
        self.document_store = QdrantDocumentStore(**QDRANT_CONFIG)

        self.pipeline = Pipeline()
        self.pipeline.add_component(PIPELINE['SPARSE_EMBEDDER'], 
                                    FastembedSparseDocumentEmbedder(model=FASTEMBED_SPARSE_MODEL, 
                                                                              cache_dir=FASTEMBED_CACHE_DIRECTORY, 
                                                                              meta_fields_to_embed=METADATA_FIELDS_TO_EMBED))
        self.pipeline.add_component(PIPELINE['DENSE_EMBEDDER'], 
                                    FastembedDocumentEmbedder(model=FASTEMBED_DENSE_MODEL, 
                                                                        cache_dir=FASTEMBED_CACHE_DIRECTORY, 
                                                                        meta_fields_to_embed=METADATA_FIELDS_TO_EMBED))
        self.pipeline.add_component(PIPELINE['DOCUMENT_WRITER'], 
                                    DocumentWriter(document_store=self.document_store, 
                                                             policy=DuplicatePolicy.OVERWRITE))

        self.pipeline.connect(PIPELINE['SPARSE_EMBEDDER'], PIPELINE['DENSE_EMBEDDER'])
        self.pipeline.connect(PIPELINE['DENSE_EMBEDDER'], PIPELINE['DOCUMENT_WRITER'])


    def index_documents(self, documents: list):
        """
        Indexes a list of documents in the Qdrant document store.

        :param documents: List of `Document` objects to index.
        """
        results = self.pipeline.run({PIPELINE['SPARSE_EMBEDDER']: {'documents': documents}},
                                                    include_outputs_from={PIPELINE['SPARSE_EMBEDDER']})
        return results


    def embed_note_information(self, note_folder: str, note_title: str, note_contents: str) -> None:
        """
        Embeds a note into a vector database.

        :param note_folder: The folder where the note is stored.
        :param note_title: The title of the note.
        :param note_contents: The textual content of the note.
        :return: Document ID of embedded note
        """
        # Populate the haystack Document with the information from the note
        note_to_embed = Document()
        note_to_embed.content = note_contents
        note_to_embed.meta = {'folder': note_folder, 'title': note_title}

        # Embed the note information
        results = self.index_documents([note_to_embed])

        # Return the ID of the embedded document
        return results[PIPELINE['SPARSE_EMBEDDER']]['documents'][0].id


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
                            CAC ID""",
                     meta={'folder': 'Automotive Maintenance', 'title': '30,0000 Maintenance'}),
            Document(content='Name: Lumenative (towards a bright future of innovation). Product name: Note-a-log (Amanuensis)',
                     meta={'folder': 'Business Ideas', 'title': 'Company Idea'}),
            Document(content="""Pasta
Ribs
Chicken and veggies
Fried chicken
                     """, meta={'folder': 'Meal Prepping'}),
            Document(content="""Strawberries (5)
Cake mix (2 cups)
whipped cream (make sure dairy-free)
                     """, meta={'folder': 'Meal Prepping'}),
            Document(content="""Considering buying cake mix with gluten-free mixture. I am interested in getting the confetti variant.
                     """,
                     meta={'folder': 'Meal Prepping'}),
            Document(content="""Follow-up with Hampton Inn for 1 night refund which was promised
Follow-up with Chipotle regarding messed-up order.
                 """, meta={'folder': 'Customer service issues'})]

    #indexer.index_documents(documents)

    document_id = indexer.embed_note_information('Test Folder', 'Test Title', 'Hello this is a test')

    print(document_id)
