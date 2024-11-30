import React, { useState } from 'react';

export default function TeamCreation() {
  const [data, setData] = useState<string[][]>([]);
  const [teamAssignments, setTeamAssignments] = useState<{ [key: number]: string }>({});
  const [teamCount, setTeamCount] = useState<number>(2); 

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const text = e.target?.result as string;
        const parsedData = parseCSV(text);
        setData(parsedData);
        setTeamAssignments({});
      };

      reader.onerror = () => {
        console.error("Failed to read the file");
      };

      reader.readAsText(file);
    }
  };

  const parseCSV = (csvText: string): string[][] => {
    const rows = csvText.split("\n").map((row) => row.trim());
    return rows
      .filter((row) => row.length > 0)
      .map((row) => row.split(";")); //sample data split by semicolon, not comma
  };

  const handleTeamChange = (rowIndex: number, team: string) => {
    setTeamAssignments((prev) => ({
      ...prev,
      [rowIndex]: team,
    }));
  };

  return (
    <div className="mt-16 min-h-screen bg-background text-foreground flex flex-col items-center justify-center">
        <label htmlFor="fileUpload" className="font-bold text-lg">
            Enter Class Roster
        </label>
        <label htmlFor="fileUpload" className="px-4 py-2 mt-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-700">
            Upload CSV
        </label>

        <input
            id="fileUpload"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
        />
      
        <div className="mt-4">
            <label htmlFor="teamCount" className="mr-2">Number of Teams:</label>
            <input
            type="number"
            id="teamCount"
            value={teamCount}
            onChange={(e) => setTeamCount(Number(e.target.value))}
            min={1}
            className="border rounded px-2 py-1"
            />
        </div>

        <div className="mt-4">
            {data.length > 0 ? (
                <table>
                <thead>
                    <tr>
                    {data[0].map((header, index) => (
                        <th key={index}>{header}</th>
                    ))}
                    <th>Team</th>
                    </tr>
                </thead>
                <tbody>
                    {data.slice(1).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {row.map((cell, colIndex) => (
                        <td key={colIndex}>{cell}</td>
                        ))}
                        <td>
                        <select
                            value={teamAssignments[rowIndex + 1] || ""}
                            onChange={(e) => handleTeamChange(rowIndex + 1, e.target.value)}
                            className="border rounded px-2 py-1"
                        >
                            <option value="">Select Team</option>
                            {Array.from({ length: teamCount }, (_, i) => (
                            <option key={i} value={`Team ${i + 1}`}>
                                Team {i + 1}
                            </option>
                            ))}
                        </select>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            ) : (
                <p>No data loaded</p>
            )}
        </div>


      <div className="mt-8">
        {Object.keys(teamAssignments).length > 0 && (
          <div>
            <h2 className='font-bold'>Team Assignments</h2>
            {Array.from({ length: teamCount }, (_, i) => (
              <div key={i} className="mt-4">
                <h3>Team {i + 1}</h3>
                <ul>
                  {Object.entries(teamAssignments)
                    .filter(([, team]) => team === `Team ${i + 1}`)
                    .map(([rowIndex]) => (
                      <li key={rowIndex}>
                        {data[+rowIndex].join(", ")}
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
