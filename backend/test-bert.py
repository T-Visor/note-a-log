from transformers import pipeline
import pprint

# List of notes with titles and content
notes = [
    {
        "title": "Grocery Shopping",
        "content": "Picked up some dairy products, fruits, and vegetables from the store today."
    },
    {
        "title": "Car Maintenance",
        "content": "Need to change the engine oil and check the tire pressure before the road trip."
    },
    {
        "title": "Research Paper",
        "content": "Started the research paper for class; it’s due next month and covers multiple chapters from the textbook."
    },
    {
        "title": "Camping Supplies",
        "content": "Bought snacks, bread, and some canned goods for the weekend camping trip."
    },
    {
        "title": "Insurance Renewal",
        "content": "The car insurance renewal is due soon, and I should look at options for better coverage."
    },
    {
        "title": "School Projects",
        "content": "Have a lab report and a group project to finish for school this week."
    },
    {
        "title": "Organic Shopping",
        "content": "Picked up some organic produce and spices to try out new recipes at home."
    },
    {
        "title": "Brake Check",
        "content": "Scheduled an appointment for car maintenance and brake check."
    },
    {
        "title": "Study Session",
        "content": "Studied with my study group and reviewed lecture notes for the upcoming midterms."
    },
    {
        "title": "Baking Supplies",
        "content": "Bought baking supplies and cereal for breakfast recipes."
    }
]

# Define categories
categories = ["groceries", "cars", "schoolwork"]

# Load zero-shot classification pipeline
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

# Classify each note and add category
classified_notes = []
for note in notes:
    result = classifier(note['content'], candidate_labels=categories)
    category = result['labels'][0]  # Select the top category
    classified_note = {
        "title": note['title'],
        "content": note['content'],
        "category": category
    }
    classified_notes.append(classified_note)

# Output the classified notes in the specified format
pprint.pprint(classified_notes)

