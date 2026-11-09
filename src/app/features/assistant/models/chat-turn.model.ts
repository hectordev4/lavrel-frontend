/** One message of a chat as the backend takes it. */
export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}
