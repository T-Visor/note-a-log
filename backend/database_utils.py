import sqlite3
import json

DATABASE_PATH = '../data/notesApp.db'
DATABASE_TABLE_WITH_NOTES = 'notes'

def main():
    """
        Fetch notes data from database as JSON and print.
    """
    print(fetch_table_data_as_json(DATABASE_PATH, DATABASE_TABLE_WITH_NOTES))


def fetch_table_data_as_json(database_path: str, table_name: str) -> str:
    """
    Connects to an SQLite database, retrieves all rows from a specified table,
    and returns the data as a JSON string.

    Args:
        database_path (str): Path to the SQLite database.
        table_name (str): Name of the table to query.

    Returns:
        str: JSON string containing the table data.
    """
    # Validate the table name (ensure it's a valid identifier)
    if not table_name.isidentifier():
        raise ValueError(f"Invalid table name: {table_name}")

    # Connect to the database
    database_connection = sqlite3.connect(database_path)

    try:
        cursor = database_connection.cursor()

        # Use string formatting safely for table name (validated earlier)
        query = f"SELECT * FROM {table_name}"

        # Execute the query
        cursor.execute(query)

        # Fetch all rows from the result
        rows = cursor.fetchall()

        # Get column names
        columns = [description[0] for description in cursor.description]

        # Map rows to dictionaries using column names as keys
        data = [dict(zip(columns, row)) for row in rows]

        # Convert the data to JSON
        json_data = json.dumps(data, indent=4)

        # Return the JSON data
        return json_data

    finally:
        # Ensure the cursor and connection are closed
        cursor.close()
        database_connection.close()


if __name__ == '__main__':
    main()
