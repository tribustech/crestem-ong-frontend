export interface JoinableOng {
  documentId: string;
  name: string;
  domeniu: string | null;
  localitate: string | null;
  memberCount: number;
  /** True when the current user already has a pending affiliation request for this ONG. */
  hasPendingRequest: boolean;
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
