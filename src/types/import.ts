export interface ImportContact {
  first_name: string;
  last_name: string;
  phone_number: string;
  personalization_fields?: Record<string, string>;
}

export interface ImportError {
  rowNumber: number;
  message: string;
  data: {
    name: string;
    phone: string;
  };
}

export interface PreviewResult {
  newContactsToAddSample: ImportContact[];
  failedToAddContactsSample: ImportError[];
  existingSystemContactsToAddSample: ImportContact[];
  existingCampaignContactsToNotAddSample: ImportContact[];
  existingSystemContactsToAddCount: ImportContact[];
  newContactsToAddCount: number;
  existingCampaignContactsToNotAddCount: number;
  failedContactsToNotAddCount: number;
  toRemoveIfEnabled?: CampaignContact[];
  removeOthers?: boolean;
}

export interface FieldMapping {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  personalization?: PersonalizationField[];
}

export interface PersonalizationField {
  key: string;
  csvHeader: string;
}

export interface CSVParseResult {
  headers: string[];
  rows: {
    values: string[];
    rowNumber: number;
  }[];
}

export interface CSVUpload {
  filePath: string;
  headers: string[];
}