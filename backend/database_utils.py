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
    move_note_to_folder('1234', 'Programming') 


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
        query = f"SELECT * FROM {table_name}"
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

    database_connection = sqlite3.connect(DATABASE_PATH)

    try:
        cursor = database_connection.cursor()
        query = f'SELECT id FROM folders {DATABASE_TABLE_WITH_FOLDERS} WHERE name = ?'
        cursor.execute(query, (folder_name,))
        matching_id_as_list = cursor.fetchone()

        # CASE 1: folder exists, move note to folder
        if matching_id_as_list:
            matching_id = matching_id_as_list[0]
            print(f'folder name: {folder_name}, id: {matching_id}')
            query = 'UPDATE {DATABASE_TABLE_WITH_NOTES} SET folderId = ? WHERE id = ?'
            cursor.execute(query, (matching_id, note_ID))
            database_connection.commit()
            print(f"Note {note_ID} has been moved to folder with ID {matching_id}.")
        # CASE 2: folder doesn't exist, create folder, then move note to folder
        else:
            query = f'INSERT INTO {DATABASE_TABLE_WITH_FOLDERS} (id, name) VALUES (?, ?)'
            new_folder_id = uuid.uuid4()
            cursor.execute(query, (new_folder_id, folder_name))
            database_connection.commit()

            query = 'UPDATE {DATABASE_TABLE_WITH_NOTES} SET folderId = ? WHERE id = ?'
            cursor.execute(query, (new_folder_id, note_ID))
            database_connection.commit()
            print(f"Note {note_ID} has been moved to folder with ID {new_folder_id}.")


    finally:
        cursor.close()
        database_connection.close()


if __name__ == '__main__':
    main()
