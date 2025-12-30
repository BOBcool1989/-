
export interface HouseholdRecord {
  date: string;
  type: string;
  address: string;
}

export interface CurrentAddressRecord {
  date: string;
  address: string;
}

export interface ExtractedInfo {
  name: string;
  idNumber: string;
  gender: string;
  birthDate: string;
  ethnicity: string;
  issueDate: string;
  issueAuthority: string;
  docNumber: string;
  householdRecords: HouseholdRecord[];
  currentAddressRecords: CurrentAddressRecord[];
}

export enum ProcessingStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
