import axios from "axios";
import databaseConnection from "@/lib/database";
import { Note } from "@/types/index";

/**
 * Fetches document IDs similar to the given embeddings ID from a local API.
 * @param embeddingsId - The embeddings ID to find similar documents for.
 * @returns An array of similar embeddings IDs.
 */
const fetchSimilarEmbeddingsIds = async (embeddingsId: string): Promise<string[]> => {
  const response = await axios.get("http://localhost:8000/retrieve_similar_to_document", {
    params: { embeddings_ID: embeddingsId }
  });

  // Assumes the response format is: { message: string[] }
  return response.data.message;
};

/**
 * Retrieves notes from the database that match any of the provided embeddings IDs.
 * @param embeddingsIds - An array of embeddings IDs to search for.
 * @returns Array of Note records matching the given embeddings IDs.
 */
const fetchNotesByEmbeddingsIds = (embeddingsIds: string[]): Note[] => {
  if (embeddingsIds.length === 0) return [];

  // Generate placeholders for parameterized query: ?, ?, ?, ...
  const placeholders = embeddingsIds.map(() => "?").join(", ");
  const query = `SELECT * FROM notes WHERE embeddingsId IN (${placeholders})`;

  // Run the query with all the IDs as parameters
  return databaseConnection.prepare(query).all(...embeddingsIds) as Note[];
};

/**
 * Entry point to retrieve and log notes similar to a given document.
 */
const main = async () => {
  const targetEmbeddingsId = "81fd2f70fadb18a395fecc23ae71fa1462fc78c7e201363ff02b07e6723297c9";
  const similarEmbeddingsIds = await fetchSimilarEmbeddingsIds(targetEmbeddingsId);
  const matchingNotes = fetchNotesByEmbeddingsIds(similarEmbeddingsIds);

  console.log("Matching Notes:", matchingNotes);
};

main();