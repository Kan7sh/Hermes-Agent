import {tool} from "@langchain/core/tools";
import {z} from "zod";
import path from "path";

export const searchMemoryTool = tool(
    async ({query},config)=>{

    },{
        name:"search_memory",
        description:`
        Retrieve relevant long-term memory (LTM) entries based on the user query.

This tool searches a vector database of previously stored summaries and returns
high-level contextual information about the user, such as preferences, goals,
past interactions, and important background knowledge.

Use this tool when:
- The query depends on past conversations or long-term context
- You need to recall user-specific information (preferences, habits, goals, etc.)
- The current input is ambiguous and may benefit from historical context
- Personalization or continuity is required

Do NOT use this tool for:
- Simple factual questions that do not depend on user history
- Real-time or short-term conversation context (use short-term memory instead)

Returns:
- A list of summarized memory entries relevant to the query
        `,
        schema:z.object({
            query:z.string().describe("The semantic search query used to retrive relevant  long-term memory.")
        })
    }
)