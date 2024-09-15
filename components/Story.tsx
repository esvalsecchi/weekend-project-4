"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useChat } from "ai/react"; // Reemplaza con la librería correcta o el path adecuado
// Add this import at the top of the file
import { Edit as FilePenIcon, Trash as TrashIcon } from "lucide-react"; // Updated icon name
import { useState } from "react";

// Add this type definition at the top of the file, after the imports
// ... existing imports ...
type Character = {
  id: number;
  name: string;
  description: string;
  personality: string;
};

interface StoryProps {
  characters: Character[];
}

export default function Story({ characters }: StoryProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null,
  );

  // Remove the duplicate declaration of characters
  // const [characters, setCharacters] = useState<Character[]>(characters);
  const [localCharacters, setLocalCharacters] =
    useState<Character[]>(characters);

  // Use useChat hook
  const { messages, append, isLoading, setMessages } = useChat();

  const handleAddCharacter = () => {
    setSelectedCharacter(null);
    setShowDialog(true);
  };

  const handleEditCharacter = (character: Character) => {
    setSelectedCharacter(character);
    setShowDialog(true);
  };

  const handleDeleteCharacter = (id: number) => {
    setLocalCharacters(localCharacters.filter((char) => char.id !== id));
  };

  const handleSaveCharacter = (character: Character) => {
    if (selectedCharacter) {
      setLocalCharacters(
        localCharacters.map((char) =>
          char.id === character.id ? character : char,
        ),
      );
    } else {
      setLocalCharacters([
        ...localCharacters,
        { ...character, id: localCharacters.length + 1 },
      ]);
    }
    setShowDialog(false);
  };

  const handleGenerateStory = () => {
    // Limpiar mensajes anteriores antes de generar una nueva historia
    setMessages([]);

    // Llamada a append para generar la historia con personajes actualizados
    append({ role: "user", content: JSON.stringify({ characters }) });
  };

  const filterMessageContent = (content: string) => {
    try {
      const parsedContent = JSON.parse(content);
      if (parsedContent.characters) {
        // Elimina la parte que no deseas mostrar
        return "";
      }
      return content; // Si no es el JSON con personajes, muestra el contenido
    } catch (error) {
      return content; // Si no es un JSON válido, muestra el contenido original
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Character Management</h1>
        <Button onClick={handleAddCharacter}>Add Character</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Personality</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {localCharacters.map((character) => (
            <TableRow key={character.id}>
              <TableCell>{character.name}</TableCell>
              <TableCell>{character.description}</TableCell>
              <TableCell>{character.personality}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditCharacter(character)}
                  >
                    <FilePenIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteCharacter(character.id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {showDialog && (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="p-6" style={{ background: "white" }}>
            <DialogHeader>
              <DialogTitle>
                {selectedCharacter ? "Edit Character" : "Add Character"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    defaultValue={selectedCharacter?.name}
                    placeholder="Enter character name"
                  />
                </div>
                <div>
                  <Label htmlFor="personality">Personality</Label>
                  <Input
                    id="personality"
                    defaultValue={selectedCharacter?.personality}
                    placeholder="Enter character personality"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  defaultValue={selectedCharacter?.description}
                  placeholder="Enter character description"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                onClick={() =>
                  handleSaveCharacter({
                    id: selectedCharacter?.id ?? localCharacters.length + 1,
                    name:
                      (document.getElementById("name") as HTMLInputElement)
                        ?.value ?? "",
                    description:
                      (
                        document.getElementById(
                          "description",
                        ) as HTMLTextAreaElement
                      )?.value ?? "",
                    personality:
                      (
                        document.getElementById(
                          "personality",
                        ) as HTMLInputElement
                      )?.value ?? "",
                  })
                }
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <div className="mt-8">
        <Button onClick={handleGenerateStory} disabled={isLoading}>
          Generate Story
        </Button>
        {isLoading && <div className="mt-4">Loading...</div>}
        {messages.length > 0 && (
          <div className="mt-4">
            <h2 className="mb-4 text-xl font-bold">Generated Story</h2>
            <div className="prose">
              {messages.map((message, index) => (
                <p key={index}>{filterMessageContent(message.content)}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
