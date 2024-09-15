// Asegúrate de que todos los componentes se importen correctamente
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
import { Edit as FilePenIcon, Trash as TrashIcon } from "lucide-react";
import { useState } from "react";

type Character = {
  id: number;
  name: string;
  description: string;
  personality: string;
};

interface StoryProps {
  characters: Character[];
  onUpdateCharacters: (characters: Character[]) => void; // Add this line
}

export default function Story({ characters, onUpdateCharacters }: StoryProps) {
  // Destructure onUpdateCharacters
  const [showDialog, setShowDialog] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null,
  );
  const [localCharacters, setLocalCharacters] =
    useState<Character[]>(characters);

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
      setLocalCharacters((prevCharacters) => {
        const updatedCharacters = prevCharacters.map((char) =>
          char.id === character.id ? character : char,
        );
        onUpdateCharacters(updatedCharacters); // Actualiza en el componente padre
        return updatedCharacters;
      });
    } else {
      setLocalCharacters((prevCharacters) => {
        const newCharacters = [
          ...prevCharacters,
          { ...character, id: prevCharacters.length + 1 },
        ];
        onUpdateCharacters(newCharacters); // Actualiza en el componente padre
        return newCharacters;
      });
    }
    setShowDialog(false);
    setSelectedCharacter(null); // Limpia el personaje seleccionado después de guardar
  };

  const handleGenerateStory = () => {
    setMessages([]);
    append({ role: "user", content: JSON.stringify({ characters }) });
  };

  const filterMessageContent = (content: string) => {
    try {
      const parsedContent = JSON.parse(content);
      if (parsedContent.characters) {
        return "";
      }
      return content;
    } catch (error) {
      return content;
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
          <DialogContent
            className="rounded-md bg-gray-900 p-6 text-white shadow-lg"
            style={{ border: "1px solid #1f2937", borderRadius: "0.375rem" }}
          >
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-gray-200">
                {selectedCharacter ? "Edit Character" : "Add Character"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm text-gray-400">
                    Name
                  </Label>
                  <Input
                    id="name"
                    className="bg-gray-800 text-white placeholder-gray-500"
                    defaultValue={selectedCharacter?.name}
                    placeholder="Enter character name"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="personality"
                    className="text-sm text-gray-400"
                  >
                    Personality
                  </Label>
                  <Input
                    id="personality"
                    className="bg-gray-800 text-white placeholder-gray-500"
                    defaultValue={selectedCharacter?.personality}
                    placeholder="Enter character personality"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description" className="text-sm text-gray-400">
                  Description
                </Label>
                <Textarea
                  id="description"
                  className="bg-gray-800 text-white placeholder-gray-500"
                  defaultValue={selectedCharacter?.description}
                  placeholder="Enter character description"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="bg-blue-600 text-white hover:bg-blue-700"
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
        <Button
          onClick={handleGenerateStory}
          disabled={isLoading}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
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
