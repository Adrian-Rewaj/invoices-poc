export interface Client {
  id: number;
  name: string;
  email: string;
  nip: string;
  createdAt: string;
}

export interface ClientChangeLog {
  id: number;
  clientId: number;
  userId: number;
  field: string;
  before: any;
  after: any;
  changedAt: string;
  user: { username: string };
}

export interface NewClient {
  name: string;
  email: string;
  nip: string;
}
