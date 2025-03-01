from retriever import Retriever
from indexer import Indexer
from haystack import Document

vector_database_retriever = Retriever()
vector_database_indexer = Indexer()


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

vector_database_indexer.index_documents(documents)

