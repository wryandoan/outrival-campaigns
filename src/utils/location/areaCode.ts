import areaCodeData from './areaCodeInfo.json';

export interface AreaCodeInfo {
  state: string;
  mainCity: string;
  country: string;
  overlayComplex: string;
  timeZone: string;
}

export function getAreaCodeInfo(phoneNumber: string): AreaCodeInfo | null {
  // Extract area code from E.164 format (+1XXXXXXXXXX)
  const areaCode = phoneNumber.replace(/^\+1/, '').slice(0, 3);
  return areaCodeData[areaCode as keyof typeof areaCodeData] || null;
}

export function getTimeZoneFromAreaCode(phoneNumber: string): string {
  const areaInfo = getAreaCodeInfo(phoneNumber);
  if (!areaInfo) return Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Convert single-letter timezone to IANA timezone
  const timezoneMap: Record<string, string> = {
    'HST': 'Pacific/Honolulu',
    'A': 'America/Anchorage',
    'E,C': 'America/Chicago', // Prioritize Central for this case
    'N': 'Pacific/Midway', // Example for N - adjust as needed
    'C': 'America/Chicago',
    'ChST': 'Pacific/Guam',
    'MST,M': 'America/Denver', // Prioritize Mountain Standard
    'P': 'America/Los_Angeles',
    'M': 'America/Denver',
    'SST': 'Pacific/Pago_Pago',
    'MST': 'America/Denver',
    'E': 'America/New_York',
    'AK,H': 'America/Anchorage', // Prioritize Alaska
    'CST': 'America/Chicago',
    'M,C': 'America/Denver', // Prioritize Mountain
    'M,P': 'America/Denver', // Prioritize Mountain
    'C,M,P': 'America/Chicago', // Prioritize Central
    'AST': 'America/Puerto_Rico',
    'EST': 'America/New_York',
    'C,M': 'America/Chicago' // Prioritize Central
  };

  return timezoneMap[areaInfo.timeZone] || Intl.DateTimeFormat().resolvedOptions().timeZone;
}