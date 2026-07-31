export type Lead = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  serviceType: string;
  message?: string;
  consent: true;
  status: "new";
  createdAt: string;
  updatedAt: string;
};
