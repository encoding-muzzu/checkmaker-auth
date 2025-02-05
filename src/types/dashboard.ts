
export interface ApplicationData {
  workflow: string;
  applicationId: string;
  status: string;
  currentActivity: {
    name: string;
    status: string;
  };
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
}
