import {Document} from "@langchain/core/documents";
import {RecursiveCharacterTextSplitter} from "@langchain/textsplitters";
import {CohereEmbeddings} from "@langchain/cohere";
import {PineconeStore} from "@langchain/pinecone";
import {Pinecone as PineconeClient} from "@pinecone-database/pinecone";
import {v4 as uuidv4} from "uuid";

import {
    ContextualCompressionRetriever
} from "@langchain/classic/retrievers/contextual_compression";
import {LLMChainExtractor} from "@langchain/classic/retrievers/document_compressors/chain_extract";
import {LLM} from "@/llm/LLM";

export async function queryVectordb(props:{userId:string,query:string}){
    const {userId,query} = props;
    const kParents = 3;

    const embeddings = new CohereEmbeddings({
        model:"embed-english-v3.0",
        apiKey:process.env.COHERE_API_KEY
    });

    const pinecone = new PineconeClient({apiKey:process.env.PINECONE_API_KEY as string});
    const pineconeIndex = pinecone.Index(process.env.PINECONE_API_KEY as string);

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings,{
        pineconeIndex,
        maxConcurrency:5
    });

    const childDocs = await vectorStore.similaritySearch(query,6,{
        docType:"child",
        userId:userId
    });

    const parentChunkIds = [...new Set(childDocs.map(c=>c.metadata.parentId))];
    const compressor = LLMChainExtractor.fromLLM(
        LLM.getInstance("fireworks_minimax")
    );
    
    const retriever = new ContextualCompressionRetriever({
        baseCompressor:compressor,
        baseRetriever:vectorStore.asRetriever({
            k:kParents,
            filter:{
                docType:"parent",
                source:{$in: parentChunkIds}
            }
        })  
    });

    const retrievedDocs = await retriever.invoke(query);
    return {
        query,
        retrievedDocs
    }
}
