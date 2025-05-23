import axios from "axios";
import databaseConnection from "@/lib/database";
import { Note, Folder } from "@/types/index";
import Mustache from 'mustache';
import { render } from "react-dom";

const MAX_CONTENT_LENGTH = 70;
const PROMPT_TEMPLATE_FOR_NOTE_CATEGORIZATION = `
You are a content categorizer. Help me organize content by selecting the most appropriate category.

Content to categorize:
Title: {{{title}}}
Content: {{{content}}}

Most similar existing content:
{{#search_results}}
Folder: {{{Folder}}}, 
Title: {{{Title}}}, 
Content: {{{Content}}}, 
Score: {{Score}}

{{/search_results}}

Existing Categories: [{{{categoriesList}}}]

Instructions:
1. Choose an existing category if it fits well
2. Create a new category only if necessary (keep it brief)
3. Return ONLY the category name without explanation

Category:`;

interface SimilarityMatch {
  id: string;
  score: number;
}

export interface EnrichedNote {
  Folder: string | null;
  Title: string;
  Content: string;
  Score: number | null;
}

/**
 * Fetches similarity matches from the local embeddings API.
 * @param embeddingsId - The ID of the document to find similar items for.
 * @returns An array of matches containing embedding IDs and similarity scores.
 */
const fetchSimilarityMatches = async (embeddingsId: string): Promise<SimilarityMatch[]> => {
  const response = await axios.get("http://localhost:8000/retrieve_similar_to_document", {
    params: { embeddings_ID: embeddingsId }
  });

  return response.data.message;
};

/**
 * Retrieves notes from the database by a list of embedding IDs.
 * @param embeddingIds - Embedding IDs to search for in the notes table.
 * @returns An array of matching Note objects.
 */
const fetchNotesByEmbeddingIds = (embeddingIds: string[]): Note[] => {
  if (embeddingIds.length === 0) return [];

  const cleanedIds = embeddingIds.map(id => id.trim());
  const placeholders = cleanedIds.map(() => "?").join(", ");
  const query = `SELECT * FROM notes WHERE embeddingsId IN (${placeholders})`;

  return databaseConnection.prepare(query).all(...cleanedIds) as Note[];
};

/**
 * Retrieves folder names for a list of notes, preserving duplicates and order.
 * @param notes - Notes whose folder names need to be fetched.
 * @returns An array of folder name records aligned to input order.
 */
const fetchFolderNamesForNotes = (notes: Note[]): { name: string | null }[] => {
  if (notes.length === 0) return [];

  const folderIds = notes.map(note => note.folderId);
  const placeholders = folderIds.map(() => "(?)").join(", ");

  const query = `
    WITH input_ids(id) AS (
      VALUES ${placeholders}
    )
    SELECT folders.name
    FROM input_ids
    LEFT JOIN folders ON folders.id = input_ids.id
  `;

  return databaseConnection.prepare(query).all(...folderIds);
};

/**
 * Builds enriched note objects with folder name, truncated content, and score.
 */
const buildEnrichedNotes = (
  notes: Note[],
  folderNames: { name: string | null }[],
  scoreMap: Map<string, number>
): EnrichedNote[] => {
  return notes.map(({ title, content, embeddingsId }, index) => ({
    Folder: folderNames[index]?.name ?? null,
    Title: title,
    Content:
      content.length > MAX_CONTENT_LENGTH
        ? content.slice(0, MAX_CONTENT_LENGTH) + "..."
        : content,
    Score: scoreMap.get(embeddingsId!)?.toFixed(2) ?? null
  }));
};

const fetchAllFolders = (): Folder[] => {
  const folders = databaseConnection.prepare('SELECT * FROM folders').all() as Folder[];
  return folders;
}

/**
 * Renders the categorization prompt using Mustache.
 * @param {string} title - The title of the note to categorize.
 * @param {string} content - The content/body of the note to categorize.
 * @param {Array<EnrichedNote>} search_results - An array of similar existing content items, each with folder, title, content, and score.
 * @param {Array<string>} categories - A list of existing category names to choose from.
 * @returns {string} The rendered prompt string to be passed to the language model.
 */
function renderNoteCategorizationPrompt(title, content, search_results, categories) {
  return Mustache.render(PROMPT_TEMPLATE_FOR_NOTE_CATEGORIZATION, {
    title,
    content,
    search_results,
    categoriesList: categories.join(', ')
  });
}

/**
 * Main execution flow for retrieving enriched notes based on a similarity query.
 */
const main = async () => {
  const currentTitle = "Hello there!";
  const currentContent = "This is another test";
  const targetEmbeddingId =
    "8f84b1e9a631a43ec95755008af664a3683c5b49ec84884e12648213174f3355";

  // Step 1: Fetch similar embedding matches
  const similarityMatches = await fetchSimilarityMatches(targetEmbeddingId);
  const matchedEmbeddingIds = similarityMatches.map(match => match.id);

  // Step 2: Retrieve notes and their associated folder names
  const matchingNotes = fetchNotesByEmbeddingIds(matchedEmbeddingIds);
  const folderNames = fetchFolderNamesForNotes(matchingNotes);

  // Step 3: Create a quick lookup for scores
  const scoreMap = new Map(similarityMatches.map(match => [match.id, match.score]));

  // Step 4: Enrich notes with folder name, truncated content, and similarity score
  const enrichedNotes = buildEnrichedNotes(matchingNotes, folderNames, scoreMap);

  const foldersNames = fetchAllFolders();
  console.log(renderNoteCategorizationPrompt(currentTitle, currentContent, enrichedNotes, folderNames.map(folder => folder.name)));
};

main();