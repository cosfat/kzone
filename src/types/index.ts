export interface Event {
  id: string;
  eventType: number;
  venue: string;
  city: string;
  date: string;
  ticketStatus: string;
  ticketLink: string;
}

export interface EventType {
  id: number;
  name: string;
}

export interface User {
  username: string;
  password: string;
}

export interface Settings {
  homepageSortOrder: string;
  hideOldEvents: boolean;
} 