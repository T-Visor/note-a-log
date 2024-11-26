import sqlite3
import uuid
from config import (
    DATABASE_PATH,
    DATABASE_TABLE_WITH_NOTES,
    DATABASE_TABLE_WITH_FOLDERS
) 

def main():
    """
        Fetch notes data from database as JSON and print.
    """
    #move_note_to_folder('e77458de-b24c-463b-a993-1c9af7205544', 'Programming') 
    # e77458de-b24c-463b-a993-1c9af7205544 Pediatrist


def fetch_table_data_as_dictionary(table_name: str) -> dict:
    """
    Connects to an SQLite database, retrieves all rows from a specified table,
    and returns the data as a dictionary (key-value pairs).

    Args:
        database_path (str): Path to the SQLite database.
        table_name (str): Name of the table to query.

    Returns:
        dict: dictionary containing the table data.
    """
    database_connection = sqlite3.connect(DATABASE_PATH)

    try:
        cursor = database_connection.cursor()

        # Fetch all rows from the table
        query = f'SELECT * FROM {table_name}'
        cursor.execute(query)
        rows = cursor.fetchall()

        # Get column names
        columns = [description[0] for description in cursor.description]

        # Return the mapped rows to dictionaries using column names as keys
        table_data_as_dict = [dict(zip(columns, row)) for row in rows]
        return table_data_as_dict

    finally:
        cursor.close()
        database_connection.close()


def move_note_to_folder(note_ID: str, folder_name: str):
    """
    Moves a note to a specified folder, creating the folder if it doesn't exist.

    Parameters:
        note_ID (str): ID of the note to move.
        folder_name (str): Name of the folder to move the note to.
    """

    database_connection = sqlite3.connect(DATABASE_PATH)

    try:
        cursor = database_connection.cursor()

        # Check if the folder exists
        select_query = f'SELECT id FROM {DATABASE_TABLE_WITH_FOLDERS} WHERE name = ?'
        cursor.execute(select_query, (folder_name,))
        matching_id_as_list = cursor.fetchone()

        # If the folder exists, get its ID; otherwise, create the folder
        if matching_id_as_list:
            folder_id = matching_id_as_list[0]
            print(f"Folder '{folder_name}' exists with ID {folder_id}.")
        else:
            folder_id = str(uuid.uuid4())
            insert_query = f'INSERT INTO {DATABASE_TABLE_WITH_FOLDERS} (id, name) VALUES (?, ?)'
            cursor.execute(insert_query, (folder_id, folder_name))
            database_connection.commit()
            print(f'Folder "{folder_name}" created with ID {folder_id}.')

        # Update the note's folderId
        update_query = f'UPDATE {DATABASE_TABLE_WITH_NOTES} SET folderId = ? WHERE id = ?'
        cursor.execute(update_query, (folder_id, note_ID))
        database_connection.commit()
        print(f'Note {note_ID} has been moved to folder with ID {folder_id}.')

    except sqlite3.Error as e:
        print(f'Database error: {e}')
    except Exception as e:
        print(f'Error: {e}')
    finally:
        cursor.close()
        database_connection.close()


if __name__ == '__main__':
    main()
