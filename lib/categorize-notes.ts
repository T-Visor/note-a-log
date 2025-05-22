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

  const cleanedIds = embeddingsIds.map(id => id.trim()); // <- just in case
  const placeholders = cleanedIds.map(() => "?").join(", ");
  const query = `SELECT * FROM notes WHERE embeddingsId IN (${placeholders})`;

  return databaseConnection.prepare(query).all(...cleanedIds) as Note[];
};

/**
 * Entry point to retrieve and log notes similar to a given document.
 */
const main = async () => {
  const targetEmbeddingsId = "36df8eda42b5ed5069850d432d18ab90c32d207ee5f2b38f06cac76b8dc7e408";
  const similarEmbeddingsIds = await fetchSimilarEmbeddingsIds(targetEmbeddingsId);
  console.log(similarEmbeddingsIds);

  const matchingNotes = fetchNotesByEmbeddingsIds(similarEmbeddingsIds);
  console.log("Matching Notes:", matchingNotes);

  const filteredInfo = matchingNotes.map(
    ({ title, content, folderId }) => ({
      Folder: folderId,
      Title: title,
      Content: content
    })
  );

  console.log(filteredInfo);
};

main();