import Head from "next/head";
import { ChangeEvent, useId, useRef, useState } from "react";
import { Oval } from "react-loader-spinner"; // Asegúrate de importar el componente Oval de react-loader-spinner

import Story from "@/components/Story";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import essay from "@/lib/essay";

type CharacterType = {
  id: number;
  name: string;
  description: string;
  personality: string;
};

const DEFAULT_CHUNK_SIZE = 1024;
const DEFAULT_CHUNK_OVERLAP = 20;
const DEFAULT_TOP_K = 2;
const DEFAULT_TEMPERATURE = 0.1;
const DEFAULT_TOP_P = 1;

export default function Home() {
  const handleUpdateCharacters = (updatedCharacters: CharacterType[]) => {
    setCharacters(updatedCharacters);
  };

  const answerId = useId();
  const queryId = useId();
  const sourceId = useId();
  const answerRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState(essay);
  const [characters, setCharacters] = useState<CharacterType[]>([]);
  const [query, setQuery] = useState(
    "Given the text provided, identify each character mentioned and provide the following details for each character: Name: The full name of the character. Description: A brief summary of the character's role, actions, or traits in the story. Personality: A short description of the character's personality traits or behavioral tendencies, based on their actions and dialogue. Format the response exactly like this example: Name: Snow White. Description: She is described as a cape-wearing girl from the land of fancy who lives with seven other men. Personality: She is lively, independent, and not afraid to speak her mind. Provide a similar structured answer for each character identified in the text",
  );
  const [needsNewIndex, setNeedsNewIndex] = useState(true);
  const [buildingIndex, setBuildingIndex] = useState(false);
  const [runningQuery, setRunningQuery] = useState(false);
  const [loading, setLoading] = useState(false); // Asegúrate de que el estado de carga esté definido
  const [nodesWithEmbedding, setNodesWithEmbedding] = useState([]);
  const [chunkSize, setChunkSize] = useState(DEFAULT_CHUNK_SIZE.toString());
  const [isVisible, setIsVisible] = useState(false);
  const [chunkOverlap, setChunkOverlap] = useState(
    DEFAULT_CHUNK_OVERLAP.toString(),
  );
  const [topK, setTopK] = useState(DEFAULT_TOP_K.toString());
  const [temperature, setTemperature] = useState(
    DEFAULT_TEMPERATURE.toString(),
  );
  const [topP, setTopP] = useState(DEFAULT_TOP_P.toString());
  const [answer, setAnswer] = useState("");
  const [fileName, setFileName] = useState<string>("");

  const scrollToAnswer = () => {
    if (answerRef.current) {
      answerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <Head>
        <title>Weekend Project 4</title>
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-6">
        <h1 className="mb-8 text-3xl font-bold text-white">
          Weekend Project 4
        </h1>

        <div className="w-full max-w-md rounded-lg bg-gray-800 p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold text-white">
            Upload your Source Text File
          </h2>
          <div className="my-1 flex flex-col space-y-4">
            <Label htmlFor={sourceId} className="font-medium text-gray-400">
              Select a text file (.txt)
            </Label>
            <div className="relative">
              <Input
                id={sourceId}
                type="file"
                accept=".txt"
                className="absolute inset-0 w-full cursor-pointer rounded border border-gray-700 bg-gray-900 p-2 text-white opacity-0"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFileName(file.name);
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const fileContent = event.target?.result as string;
                      setText(fileContent);
                      setNeedsNewIndex(true);
                    };
                    if (file.type !== "text/plain") {
                      console.error(`${file.type} parsing not implemented`);
                      setText("Error");
                    } else {
                      reader.readAsText(file);
                    }
                  }
                }}
              />
              <div className="flex items-center justify-between rounded border border-gray-700 bg-gray-900 p-2">
                <span className="text-gray-500">
                  {fileName || "No file chosen"}
                </span>
                <Button className="rounded bg-blue-500 px-4 py-1 font-semibold text-white hover:bg-blue-600">
                  Choose File
                </Button>
              </div>
            </div>
          </div>

          <Button
            className={`mt-6 w-full rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white shadow-md hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 ${
              buildingIndex || !needsNewIndex || runningQuery
                ? "cursor-not-allowed opacity-50"
                : ""
            }`}
            disabled={!needsNewIndex || buildingIndex || runningQuery}
            onClick={async () => {
              setAnswer("Building index...");
              setBuildingIndex(true);
              setNeedsNewIndex(false);
              const result = await fetch("/api/splitandembed", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  document: text,
                  chunkSize: parseInt(chunkSize),
                  chunkOverlap: parseInt(chunkOverlap),
                }),
              });
              const { error, payload } = await result.json();

              if (error) {
                setAnswer(error);
              }

              if (payload) {
                setNodesWithEmbedding(payload.nodesWithEmbedding);
                setAnswer("Book Loaded!");
                scrollToAnswer();
              }

              setBuildingIndex(false);
            }}
          >
            {buildingIndex ? "Building Vector Index..." : "Load Book"}
          </Button>
        </div>

        {!buildingIndex && !needsNewIndex && !runningQuery && (
          <>
            {/* UI for extracting characters */}
            <div className="mx-auto mt-8 flex w-full max-w-md flex-col items-center justify-center rounded-lg bg-gray-800 p-6 shadow-md">
              <h2 className="mb-4 text-2xl font-semibold text-white">
                Extract Characters from the File
              </h2>

              <div className="flex w-full space-x-2">
                <Button
                  type="submit"
                  className={`w-full rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white shadow-md hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 ${
                    needsNewIndex || buildingIndex || runningQuery
                      ? "cursor-not-allowed opacity-50"
                      : ""
                  }`}
                  disabled={needsNewIndex || buildingIndex || runningQuery}
                  onClick={async () => {
                    setAnswer("Running query...");
                    setRunningQuery(true);
                    setLoading(true); // Inicia el estado de carga
                    const result = await fetch("/api/retrieveandquery", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        query,
                        nodesWithEmbedding,
                        topK: parseInt(topK),
                        temperature: parseFloat(temperature),
                        topP: parseFloat(topP),
                      }),
                    });

                    const { error, payload } = await result.json();

                    if (error) {
                      setAnswer(error);
                    }

                    if (payload) {
                      setAnswer(payload.response);
                      setCharacters(payload.characters);
                      scrollToAnswer(); // Desplazarse a la respuesta cuando se recibe
                    }

                    setRunningQuery(false);
                    setLoading(false); // Detiene el estado de carga
                  }}
                >
                  Extract Characters
                </Button>
              </div>
            </div>

            {/* Mostrar efecto de carga */}
            {loading && (
              <div className="mt-4 flex items-center justify-center">
                <Oval
                  height={50}
                  width={50}
                  color="#4fa94d"
                  visible={true}
                  ariaLabel="oval-loading"
                  secondaryColor="#4fa94d"
                  strokeWidth={2}
                  strokeWidthSecondary={2}
                />
              </div>
            )}

            {/* Sección de resultados */}
            <div className="mx-auto mt-8 flex w-full max-w-4xl flex-col items-center justify-center rounded-lg bg-gray-800 p-6 shadow-md">
              <Story
                characters={characters}
                onUpdateCharacters={handleUpdateCharacters}
              />
            </div>
          </>
        )}
      </main>
    </>
  );
}
