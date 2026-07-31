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

export interface LeadRow {
  id: string;
  first_name: string;
  last_name: string;
  email_address: string;
  phone_number: string;
  service_type: string;
  message: string | null;
  consent: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export function toRow(lead: Lead): LeadRow {
  return {
    id: lead.id,
    first_name: lead.firstName,
    last_name: lead.lastName,
    email_address: lead.emailAddress,
    phone_number: lead.phoneNumber,
    service_type: lead.serviceType,
    message: lead.message ?? null,
    consent: lead.consent,
    status: lead.status,
    created_at: lead.createdAt,
    updated_at: lead.updatedAt,
  };
}

export function fromRow(row: LeadRow): Lead {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    emailAddress: row.email_address,
    phoneNumber: row.phone_number,
    serviceType: row.service_type,
    message: row.message ?? undefined,
    consent: row.consent as true,
    status: row.status as "new",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
