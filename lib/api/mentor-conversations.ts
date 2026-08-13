export interface ConversationOng {
  documentId: string;
  name: string;
  logo: { documentId: string; name: string; url: string } | null;
}

export interface ConversationListItem {
  documentId: string;
  ong: ConversationOng | null;
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
