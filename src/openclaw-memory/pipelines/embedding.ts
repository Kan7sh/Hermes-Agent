import {Document} from "@langchain/core/documents";
import {RecursiveCharacterTextSplitter} from "@langchain/textsplitters";
import {CohereEmbeddings} from "@langchain/cohere";
import {PineconeStore} from "@langchain/pinecone";
import {Pinecone as PineconeClient} from "@pinecone-database/pinecone";
import {v4 as uuidv4} from "uuid";

async function loadRawDocs(allDocs:Document[]){
    return allDocs.flat();;
}

async function createParentDocs(props:{rawDocs:Document[],userId:String}){
    const {rawDocs,userId} = props;
    const parentSplitter = new RecursiveCharacterTextSplitter({chunkSize:2000,chunkOverlap:400});
    const parentSplits = await parentSplitter.splitDocuments(rawDocs);

    return parentSplits.map((split)=>{
        const chunkId = uuidv4();
        split.metadata.docType = "parent";
        split.metadata.chunkId = chunkId;
        split.metadata.parentId = chunkId;
        split.metadata.source = chunkId;
        split.metadata.userId = userId;

        return split;
    });
}

async function createChildDocs(props:{parentDocs:Document[],userId:String}){
    const {parentDocs,userId} = props;
    const childSplitter = new RecursiveCharacterTextSplitter({chunkSize:800,chunkOverlap:100});
    const childSplits = await childSplitter.splitDocuments(parentDocs);   
    
        return childSplits.map((split,i)=>{

        const parentIndex = Math.floor(i/4);
        const parentMetaData = parentDocs[parentIndex]?.metadata;

        split.metadata.docType = "parent";
        split.metadata.parentId = parentMetaData.chunkId;
        split.metadata.chunkId = `child-${parentMetaData.chunkId}-${i}`;
        split.metadata.source = split.metadata.chunkId;
        split.metadata.userId = userId;

        return split;
    });
}

export async function docEmbedding(props:{allDocs:Document[],userId:String}){
    const {allDocs,userId}=props;
    const embeddings = new CohereEmbeddings({
        model:"embed-english-v3.0",
        apiKey:process.env.COHERE_API_KEY
    });
    const pinecone = new PineconeClient({apiKey:process.env.PINECONE_API_KEY as string});
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX as string);
    
    console.log("Loading raw documents...");
    const rawDocs = await loadRawDocs(allDocs);

    console.log("Creating parent chunks");
    const parentDocs = await createParentDocs({rawDocs,userId});
    console.log("Parent Doc : ",parentDocs);

    console.log("Creating child chunks..");
    const childDocs = await createChildDocs({parentDocs,userId});

    console.log("Storing in pinecone..");
    const vectorStore =  new PineconeStore(embeddings,{
        pineconeIndex,
        maxConcurrency:5
    });

    await vectorStore.addDocuments([...parentDocs,...childDocs]);
    
    console.log(`Single Index: ${parentDocs.length} parent chunks + ${childDocs.length} child chunks`);
    console.log(`Total documents: ${parentDocs.length+ childDocs.length}`);
    

}