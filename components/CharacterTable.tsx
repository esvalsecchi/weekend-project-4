import React from "react";

type Character = {
  name: string;
  description: string;
  personality: string;
};

type Props = {
  characters: Character[];
};

const CharacterTable: React.FC<Props> = ({ characters }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Personality
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {characters.map((character, index) => (
            <tr key={index}>
              <td className="whitespace-normal break-words px-6 py-4 text-sm text-gray-900">
                {character.name}
              </td>
              <td className="whitespace-normal break-words px-6 py-4 text-sm text-gray-900">
                {character.description}
              </td>
              <td className="whitespace-normal break-words px-6 py-4 text-sm text-gray-900">
                {character.personality}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CharacterTable;
