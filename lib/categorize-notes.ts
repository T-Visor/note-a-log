import axios from "axios";
import databaseConnection from "@/lib/database";
import { Note } from "@/types/index";

const MAX_CHARACTER_COUNT = 70;

interface SimilarResult {
  id: string;
  score: number;
}

/**
 * Fetches similarity results for a given embeddings ID from the local API.
 * @param embeddingsId - The embeddings ID to find similar documents for.
 * @returns An array of objects containing matched embeddings IDs and similarity scores.
 */
const fetchSimilarResults = async (embeddingsId: string): Promise<SimilarResult[]> => {
  const response = await axios.get("http://localhost:8000/retrieve_similar_to_document", {
    params: { embeddings_ID: embeddingsId }
  });

  return response.data.message;
};

/**
 * Retrieves notes from the database that match any of the provided embeddings IDs.
 * @param embeddingsIds - An array of embeddings IDs to search for.
 * @returns Array of Note records matching the given embeddings IDs.
 */
const fetchNotesByEmbeddingIds = (embeddingsIds: string[]): Note[] => {
  if (embeddingsIds.length === 0) return [];

  const cleanedIds = embeddingsIds.map(id => id.trim());
  const placeholders = cleanedIds.map(() => "?").join(", ");
  const query = `SELECT * FROM notes WHERE embeddingsId IN (${placeholders})`;

  return databaseConnection.prepare(query).all(...cleanedIds) as Note[];
};

/**
 * Entry point to retrieve and log enriched notes similar to a given document.
 */
const main = async () => {
  const targetEmbeddingsId =
    "36df8eda42b5ed5069850d432d18ab90c32d207ee5f2b38f06cac76b8dc7e408";

  const similarResults = await fetchSimilarResults(targetEmbeddingsId);
  console.log("Similarity Results:", similarResults);

  const matchedEmbeddingIds = similarResults.map(result => result.id);
  const matchingNotes = fetchNotesByEmbeddingIds(matchedEmbeddingIds);
  console.log("Matching Notes:", matchingNotes);

  const embeddingScoreMap = new Map(
    similarResults.map(result => [result.id, result.score])
  );

  const enrichedNotes = matchingNotes.map(({ title, content, folderId, embeddingsId }) => ({
    Folder: folderId,
    Title: title,
    Content: content.length > MAX_CHARACTER_COUNT ? content.slice(0, MAX_CHARACTER_COUNT) + "..." : content,
    Score: embeddingScoreMap.get(embeddingsId!) ?? null
  }));

  console.log("Enriched Notes:", enrichedNotes);
};

main();