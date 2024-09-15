import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";

export function Book() {
  const [file, setFile] = useState<File | null>(null); // Update state type to allow File or null
  const [characters, setCharacters] = useState<
    { name: string; description: string; personality: string }[]
  >([]);
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Specify the type of 'event'
    const files = event.target.files; // Store files in a variable
    setFile(files && files.length > 0 ? files[0] : null); // Check if files is not null and has at least one file
  };
  const extractCharacters = async () => {
    try {
      if (file) {
        // Check if file is not null
        const extractedCharacters: {
          name: string;
          description: string;
          personality: string;
        }[] = await simulateCharacterExtraction(file);
        setCharacters(extractedCharacters);
      } else {
        console.error("No file uploaded."); // Handle the case where no file is uploaded
      }
    } catch (error) {
      console.error("Error extracting characters:", error);
    }
  };
  const simulateCharacterExtraction = (
    file: File,
  ): Promise<{ name: string; description: string; personality: string }[]> => {
    // Specify return type
    return new Promise((resolve) => {
      setTimeout(() => {
        const characters = [
          {
            name: "Frodo Baggins",
            description:
              "A hobbit who embarks on a quest to destroy an evil ring.",
            personality: "Brave, loyal, and determined",
          },
          {
            name: "Gandalf the Grey",
            description:
              "A wise and powerful wizard who guides the Fellowship.",
            personality: "Mysterious, knowledgeable, and benevolent",
          },
          {
            name: "Aragorn",
            description:
              "The heir to the throne of Gondor, who helps lead the Fellowship.",
            personality: "Courageous, noble, and humble",
          },
          {
            name: "Legolas",
            description: "An elf archer who joins the Fellowship.",
            personality: "Skilled, graceful, and observant",
          },
          {
            name: "Gimli",
            description: "A dwarf warrior who accompanies the Fellowship.",
            personality: "Gruff, loyal, and proud",
          },
        ];
        resolve(characters);
      }, 2000);
    });
  };
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background text-foreground">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Character Extractor</h1>
          <p className="text-muted-foreground">
            Upload a .txt file and extract characters from the content.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Input
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            className="flex-1"
          />
          <Button onClick={extractCharacters}>Extract Characters</Button>
        </div>
        {characters.length > 0 && (
          <div className="space-y-4">
            <div className="rounded-md bg-card p-4">
              <h2 className="text-lg font-bold">Characters</h2>
              <div className="mt-4 space-y-2">
                {characters.map((character, index) => (
                  <div key={index} className="space-y-1">
                    <div className="font-medium">{character.name}</div>
                    <div className="text-muted-foreground">
                      {character.description}
                    </div>
                    <div className="text-muted-foreground">
                      {character.personality}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-md bg-card p-4">
              <h2 className="text-lg font-bold">Characters (Table)</h2>
              <Table className="mt-4">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Personality</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {characters.map((character, index) => (
                    <TableRow key={index}>
                      <TableCell>{character.name}</TableCell>
                      <TableCell>{character.description}</TableCell>
                      <TableCell>{character.personality}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
