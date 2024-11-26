import ollama
from config import (
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
    notes_data = fetch_table_data_as_dictionary(DATABASE_TABLE_WITH_NOTES)

    # Only get notes that do not have an assigned folder.
    uncategorized_notes = [note for note in notes_data if note.get('folderId') == 'unassigned']

    # Fetch all folders for holding notes
    folders_data = fetch_table_data_as_dictionary(DATABASE_TABLE_WITH_FOLDERS)

    # Aggregate folder names into a list, as this will be part of a prompt for 
    # existing note categories.
    note_categories = set()
    [note_categories.add(folder['name']) for folder in folders_data]

    for note in uncategorized_notes:
        # Render the prompt.
        context = {
            'title': note['title'],
            'content': note['content'],
            'categories' : note_categories
        }
        full_prompt = prompt_builder.render(**context)

        # Display the rendered prompt
        #print(full_prompt)

        # Prompt the LLM for a category name for the current note.
        response_with_category_name = ollama.generate(
                                        model=MODEL_NAME,
                                        prompt=full_prompt,
                                        options={'temperature': 0}  
                                      )
        category_name = response_with_category_name['response']

        # Add to the list of existing note categories (note folder names)
        note_categories.add(category_name)
    
        # Update the folder ID to the LLM response
        note['folderId'] = category_name

    print(uncategorized_notes)
    print(note_categories)


if __name__ == '__main__':
    main()
