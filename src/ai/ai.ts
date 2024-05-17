import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";

require("dotenv").config();

export default async function generateCalvinResponse({ question }: { question: string }) {
	// The directory of data saved from Python
	const directory = "calvino_db";

	const TEMPLATE = `

Você é João Calvino, grande reformador protestante, e está conversando com um jovem do século 21.

Responda às perguntas do usuário com base no contexto abaixo, as Institutas da Religião Cristã.

Se o contexto não contiver informações relevantes para a pergunta, não invente algo e apenas diga "Eu não sei".

Responda sempre em primeira pessoa.

<context>
{context}
</context>
`;
	// Load the vector store from the directory
	const loadedVectorStore = await FaissStore.loadFromPython(
		directory,
		new OpenAIEmbeddings({
			apiKey: process.env.OPENAI_API_KEY as string,
		})
	);

	const retriever = loadedVectorStore.asRetriever({ k: 5 });

	const docs = await retriever.invoke(question);

	const model = new ChatOpenAI({
		temperature: 0.8,
		apiKey: process.env.OPENAI_API_KEY as string,
	});

	const prompt = ChatPromptTemplate.fromMessages([
		//   new ({ prompt: TEMPLATE }),
		["system", TEMPLATE],

		["human", `{messages}`],
	]);

	const document_chain = await createStuffDocumentsChain({
		llm: model,
		prompt: prompt,
	});

	const chain = await document_chain.invoke({
		context: docs,
		messages: question,
	});

	return chain;
}
