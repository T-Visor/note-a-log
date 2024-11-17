import sqlite3
import json

DATABASE_PATH = '../data/notesApp.db'
DATABASE_TABLE_WITH_NOTES = 'notes'

def main():
    """
        Fetch notes data from database as JSON and print.
    """
    notes_data = fetch_table_data_as_dictionary(DATABASE_PATH, DATABASE_TABLE_WITH_NOTES)


def fetch_table_data_as_dictionary(database_path: str, table_name: str) -> dict:
    """
    Connects to an SQLite database, retrieves all rows from a specified table,
    and returns the data as a dictionary (key-value pairs).

    Args:
        database_path (str): Path to the SQLite database.
        table_name (str): Name of the table to query.

    Returns:
        dict: dictionary containing the table data.
    """
    # Validate the table name (ensure it's a valid identifier)
    if not table_name.isidentifier():
        raise ValueError(f"Invalid table name: {table_name}")

    database_connection = sqlite3.connect(database_path)

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


if __name__ == '__main__':
    main()
