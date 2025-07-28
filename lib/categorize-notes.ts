import axios from "axios";
import databaseConnection from "@/lib/database";
import { Note, Folder } from "@/types/index";
import Mustache from "mustache";
import ollama from "ollama";

const MAX_NOTE_CONTENT_LENGTH = 70;
const PROMPT_TEMPLATE_FOR_NOTE_CATEGORIZATION = `
You are a content categorizer. Help me organize content by selecting the most appropriate category.

Content to categorize:
Title: {{{title}}}
Content: {{{content}}}

{{#searchResults}}
Most similar existing content:
Folder: {{{Folder}}}, 
Title: {{{Title}}}, 
Content: {{{Content}}}, 
Score: {{Score}}

{{/searchResults}}

{{#categoriesList}}
Existing Categories: [{{{categoriesList}}}]
{{/categoriesList}}

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
 * Builds enriched note objects with folder name, title, truncated content, and score.
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
      content.length > MAX_NOTE_CONTENT_LENGTH
        ? content.slice(0, MAX_NOTE_CONTENT_LENGTH) + "..."
        : content,
    Score: scoreMap.get(embeddingsId!)?.toFixed(2) ?? null
  }));
};

const fetchAllFolders = (): Folder[] => {
  const folders = databaseConnection.prepare("SELECT * FROM folders WHERE id != 'unassigned'").all() as Folder[];
  return folders;
}

const notesAssignedToFoldersExist = (): boolean => {
  const notes = databaseConnection.prepare("SELECT * FROM notes WHERE folderId != 'unassigned'").all() as Note[];
  return (Array.isArray(notes) && notes.length > 0);
}

/**
 * Renders the categorization prompt using Mustache.
 * @param {string} title - The title of the note to categorize.
 * @param {string} content - The content/body of the note to categorize.
 * @param {Array<EnrichedNote>} searchResults - An array of similar existing content items, each with folder, title, content, and score.
 * @param {Array<string>} categories - A list of existing category names to choose from.
 * @returns {string} The rendered prompt string to be passed to the language model.
 */
const renderNoteCategorizationPrompt = (
  title: string,
  content: string,
  searchResults: EnrichedNote[],
  categories: string[]
): string => {
  return Mustache.render(PROMPT_TEMPLATE_FOR_NOTE_CATEGORIZATION, {
    title,
    content,
    searchResults: searchResults,
    categoriesList: categories.join(', ')
  });
}

/**
 * Generates a note category using a language model (Ollama).
 * @param {string} prompt - The formatted prompt string.
 * @returns {Promise<string>} The generated LLM response.
 */
const generateCategoryUsingPrompt = async (
  prompt: string
): Promise<string> => {
  const response = await ollama.chat({
    model: "llama3.1:8b-instruct-q3_K_S",
    messages: [
      { role: "user", content: prompt }
    ],
    options: {
      temperature: 0
    },
  });

  return response.message.content;
};

/**
 * Main execution flow for retrieving enriched notes based on a similarity query.
 */
export const categorizeNoteWithAI = async (
  noteTitle: string,
  noteContent: string,
  noteEmbeddingID: string
): Promise<string> => {
  
  let noteCategorizationPrompt;
  let enrichedNotes: EnrichedNote[] = [];
  const allExistingFolders = fetchAllFolders();

  // Only do a search for similar notes that are assigned to folders already.
  if (notesAssignedToFoldersExist()) {
    // Fetch similar embedding matches
    const similarityMatches = await fetchSimilarityMatches(noteEmbeddingID);
    const matchedEmbeddingIds = similarityMatches.map(match => match.id);

    // Retrieve notes and their associated folder names
    const matchingNotes = fetchNotesByEmbeddingIds(matchedEmbeddingIds);
    const folderNames = fetchFolderNamesForNotes(matchingNotes);

    // Enrich notes with folder name, truncated content, and similarity score
    const scoreMap = new Map(similarityMatches.map(match => [match.id, match.score]));
    enrichedNotes = buildEnrichedNotes(matchingNotes, folderNames, scoreMap);
  }

  // Build the enriched prompt
  noteCategorizationPrompt = renderNoteCategorizationPrompt(
    noteTitle,
    noteContent,
    enrichedNotes,
    allExistingFolders.map(folder => folder.name)
  );
  console.log(noteCategorizationPrompt)

  // Step 7: Fetch the resulting category name from the large language model
  const categoryName = await generateCategoryUsingPrompt(noteCategorizationPrompt);
  return categoryName;
};

const main = async () => {
  const currentTitle = "Hello there!";
  const currentContent = "This is another test";
  const targetEmbeddingId = "349f062f6d2784ae0a56e71d405b4e7e8cef261aa46a27060f2e7862e7a56edb";
  const category = await categorizeNoteWithAI(currentTitle, currentContent, targetEmbeddingId);
  console.log(category);
}
main();