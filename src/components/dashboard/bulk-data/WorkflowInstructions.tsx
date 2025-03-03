
import React from "react";

export const WorkflowInstructions = () => {
  return (
    <div className="mb-4 p-4 bg-gray-50 rounded border border-gray-200">
      <h3 className="font-medium mb-2">Workflow Instructions:</h3>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li>System automatically generates Excel files for processing every 5 minutes.</li>
        <li><strong>Maker 1:</strong> Download the file, update it locally, then upload your version.</li>
        <li><strong>Maker 2:</strong> Download Maker 1's file, review and update it, then upload the final version.</li>
        <li><strong>Note:</strong> A maker cannot be both Maker 1 and Maker 2 for the same file.</li>
      </ul>
    </div>
  );
};
