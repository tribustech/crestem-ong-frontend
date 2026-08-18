export interface ConversationMentor {
  documentId: string;
  nume: string;
  mentorOrganization: string | null;
  avatar: { documentId: string; name: string; url: string } | null;
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
