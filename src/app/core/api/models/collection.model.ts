/** One of the member's collections. id is its public id (a UUID); gameCount is what the library shows in it now. */
export interface Collection {
  id: string;
  name: string;
  position: number;
  gameCount: number;
}
