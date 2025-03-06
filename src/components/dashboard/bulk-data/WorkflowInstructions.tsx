
import React from "react";

export const WorkflowInstructions = () => {
  return (
    <div className="mb-4 p-4 bg-gray-50 rounded border border-gray-200">
      <h3 className="font-medium mb-2">Workflow Instructions:</h3>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li>System automatically generates Excel files for processing every 5 minutes.</li>
        <li><strong>Maker:</strong> Download the file, update it locally, then upload your version.</li>
        <li><strong>Checker:</strong> Download Maker's file, review and update it, then upload the final version.</li>
        <li><strong>Note:</strong> A user cannot be both Maker and Checker for the same file.</li>
      </ul>
    </div>
  );
};
