import ollama
from config import (
    DATABASE_PATH, 
    DATABASE_TABLE_WITH_NOTES,
    DATABASE_TABLE_WITH_FOLDERS,
    MODEL_NAME,
    PROMPT_TEMPLATE
)
from database_utils import fetch_table_data_as_dictionary
from prompt_builder import PromptBuilder


def main():
    # Initialize prompt builder
    prompt_builder = PromptBuilder(PROMPT_TEMPLATE)
    
    # Fetch all notes
    notes_data = fetch_table_data_as_dictionary(DATABASE_PATH,
                                                DATABASE_TABLE_WITH_NOTES)

    # Fetch all folders for holding notes
    folders_data = fetch_table_data_as_dictionary(DATABASE_PATH,
                                                  DATABASE_TABLE_WITH_FOLDERS)

    # Aggregate folder names into a list, as this will be part of a prompt for 
    # existing note categories.
    note_categories = set()
    [note_categories.add(folder['name']) for folder in folders_data]

    for note in notes_data:
        # Render the prompt.
        context = {
            'title': note['title'],
            'content': note['content'],
            'categories' : note_categories
        }
        full_prompt = prompt_builder.render(**context)
        print(full_prompt)

        response = ollama.generate(
                        model=MODEL_NAME,
                        prompt=full_prompt,
                        options={'temperature': 0}  # Adjust the temperature as needed
                   )
        print(response['response'])
        note_categories.add(response['response'])

    print(note_categories)


if __name__ == '__main__':
    main()
