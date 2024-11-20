import ollama
from config import (
    DATABASE_PATH, 
    DATABASE_TABLE_WITH_NOTES,
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

    note_categories = []

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
                        prompt=full_prompt
                   )
        print(response['response'])
        note_categories.append(response['response'])

    print(note_categories)


if __name__ == '__main__':
    main()
