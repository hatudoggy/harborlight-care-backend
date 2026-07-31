export type Lead = {
  id: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  serviceType: string;
  message?: string;
  consent: true;
  status: "new";
  createdAt: string;
  updatedAt: string;
};
