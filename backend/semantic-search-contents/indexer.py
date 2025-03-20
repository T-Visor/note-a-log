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
from markdown_to_plain import strip_markdown

# Define pipeline component names as constants
PIPELINE_COMPONENTS = {
    "SPARSE_EMBEDDER": "sparse_document_embedder",
    "DENSE_EMBEDDER": "dense_document_embedder",
    "DOCUMENT_WRITER": "document_writer"
}


class Indexer:
    """
    Indexer class to handle document embedding and indexing using the Qdrant vector database.

    This class sets up a pipeline that processes documents by embedding them with both sparse 
    and dense embeddings before storing them in a Qdrant document store.
    """

    def __init__(self):
        """
        Initializes the indexing pipeline with the Qdrant document store and embedding components.
        """
        # Initialize the document store
        self.document_store = QdrantDocumentStore(**QDRANT_CONFIG)

        # Create the document processing pipeline
        self.pipeline = Pipeline()

        # Add sparse embedding component
        self.pipeline.add_component(
            PIPELINE_COMPONENTS['SPARSE_EMBEDDER'],
            FastembedSparseDocumentEmbedder(
                model=FASTEMBED_SPARSE_MODEL,
                cache_dir=FASTEMBED_CACHE_DIRECTORY,
                meta_fields_to_embed=METADATA_FIELDS_TO_EMBED
            )
        )

        # Add dense embedding component
        self.pipeline.add_component(
            PIPELINE_COMPONENTS['DENSE_EMBEDDER'],
            FastembedDocumentEmbedder(
                model=FASTEMBED_DENSE_MODEL,
                cache_dir=FASTEMBED_CACHE_DIRECTORY,
                meta_fields_to_embed=METADATA_FIELDS_TO_EMBED
            )
        )

        # Add document writer component for storing documents in Qdrant
        self.pipeline.add_component(
            PIPELINE_COMPONENTS['DOCUMENT_WRITER'],
            DocumentWriter(
                document_store=self.document_store,
                policy=DuplicatePolicy.OVERWRITE
            )
        )

        # Define pipeline connections:
        # 1. Sparse embeddings are processed first
        # 2. Then, dense embeddings are applied
        # 3. Finally, the document is stored
        self.pipeline.connect(
            PIPELINE_COMPONENTS['SPARSE_EMBEDDER'], 
            PIPELINE_COMPONENTS['DENSE_EMBEDDER']
        )
        self.pipeline.connect(
            PIPELINE_COMPONENTS['DENSE_EMBEDDER'], 
            PIPELINE_COMPONENTS['DOCUMENT_WRITER']
        )


    def index_documents(self, documents: list) -> dict:
        """
        Embeds and indexes a list of documents in the Qdrant document store.

        :param documents: List of `Document` objects to be indexed.
        :return: A dictionary containing the pipeline execution results.
        """
        results = self.pipeline.run(
            {PIPELINE_COMPONENTS['SPARSE_EMBEDDER']: {'documents': documents}},
            include_outputs_from={PIPELINE_COMPONENTS['SPARSE_EMBEDDER']}
        )
        return results
    

    def embed_note_information(self, note_folder: str, note_title: str, note_contents: str) -> str:
        """
        Embeds a note and indexes it into the vector database.

        :param note_folder: Folder path where the note is stored.
        :param note_title: Title of the note.
        :param note_contents: The textual content of the note.

        :return: The document ID of the embedded note.
        """
        # Create a Haystack Document object with note metadata
        note_to_embed = Document(
            content=strip_markdown(note_contents),
            meta={'folder': note_folder, 'title': note_title}
        )

        # Embed and store the note
        results = self.index_documents([note_to_embed])

        # Retrieve and return the document ID after embedding
        return results[PIPELINE_COMPONENTS['SPARSE_EMBEDDER']]['documents'][0].id


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

    indexer.index_documents(documents)

    #document_id = indexer.embed_note_information('Test Folder', 'Test Title', 'Hello this is a test')

    #print(document_id)
