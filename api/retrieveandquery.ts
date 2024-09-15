import type { NextApiRequest, NextApiResponse } from "next";

import {
  IndexDict,
  OpenAI,
  RetrieverQueryEngine,
  TextNode,
  VectorStoreIndex,
  serviceContextFromDefaults,
} from "llamaindex";

type Input = {
  query: string;
  topK?: number;
  nodesWithEmbedding: {
    text: string;
    embedding: number[];
  }[];
  temperature: number;
  topP: number;
};

type Character = {
  name: string;
  description: string;
  personality: string;
};

type Output = {
  error?: string;
  payload?: {
    response?: string;
    characters?: Character[];
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Output>,
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { query, topK, nodesWithEmbedding, temperature, topP }: Input =
    req.body;

  const embeddingResults = nodesWithEmbedding.map((config) => {
    return new TextNode({ text: config.text, embedding: config.embedding });
  });
  const indexDict = new IndexDict();
  for (const node of embeddingResults) {
    indexDict.addNode(node);
  }

  const index = await VectorStoreIndex.init({
    indexStruct: indexDict,
    serviceContext: serviceContextFromDefaults({
      llm: new OpenAI({
        model: "gpt-4",
        temperature: temperature,
        topP: topP,
      }),
    }),
  });

  index.vectorStore.add(embeddingResults);
  if (!index.vectorStore.storesText) {
    await index.docStore.addDocuments(embeddingResults, true);
  }
  await index.indexStore?.addIndexStruct(indexDict);
  index.indexStruct = indexDict;

  const retriever = index.asRetriever();
  retriever.similarityTopK = topK ?? 2;

  const queryEngine = new RetrieverQueryEngine(retriever);

  const result = await queryEngine.query(query);

  // Procesar la respuesta para extraer los personajes
  const responseText = result.response;

  // Ajustar la expresión regular para extraer correctamente los personajes
  const characterRegex =
    /Name:\s*([^\.]+)\.\s*Description:\s*([^\.]+)\.\s*Personality:\s*([^\.]+)\./g;
  const characters: Character[] = [];
  let match;

  // Extraer todos los personajes, descripciones y personalidades utilizando el regex
  while ((match = characterRegex.exec(responseText)) !== null) {
    const name = match[1].trim();
    const description = match[2].trim();
    const personality = match[3].trim();
    characters.push({ name, description, personality });
  }

  // Devolver el texto original y el array de objetos con los personajes extraídos
  res.status(200).json({ payload: { response: responseText, characters } });
}
