import ollama
import config
from database_utils import fetch_table_data_as_dictionary

def main():

    notes_data = fetch_table_data_as_dictionary(config.DATABASE_PATH,
                                                config.DATABASE_TABLE_WITH_NOTES)
    print(notes_data)

    #response = ollama.generate(
    #                model=config.MODEL_NAME,
    #                prompt='Reply with one word, what color is the sky?'
    #           )

    #print(response['response'])

if __name__ == '__main__':
    main()
