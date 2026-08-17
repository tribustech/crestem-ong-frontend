export interface JoinableOng {
  documentId: string;
  name: string;
  domeniu: string | null;
  localitate: string | null;
  memberCount: number;
}

export interface OngJoinRequest {
  documentId: string;
  message: string | null;
  createdAt: string;
  user: {
    documentId: string;
    nume: string;
    email: string;
  };
}
