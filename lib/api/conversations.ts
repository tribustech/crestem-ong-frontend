export interface ConversationMentor {
  documentId: string;
  /** `Anonim <documentId>` once the account is deleted — the backend anonymizes it. */
  nume: string;
  mentorOrganization: string | null;
  avatar: { documentId: string; name: string; url: string } | null;
  /**
   * The person resource deleted their account. The conversation stays readable
   * but is archived: greyed out, no composer. The backend refuses the send too.
   */
  isDeleted: boolean;
}

export interface ConversationProgram {
  documentId: string;
  name: string;
}

export interface ConversationListItem {
  documentId: string;
  mentor: ConversationMentor | null;
  program: ConversationProgram | null;
  lastMessage: { content: string; createdAt: string } | null;
  lastMessageAt: string | null;
  unread: boolean;
}

export interface ConversationMessage {
  documentId: string;
  content: string;
  createdAt: string;
  fromMe: boolean;
}
