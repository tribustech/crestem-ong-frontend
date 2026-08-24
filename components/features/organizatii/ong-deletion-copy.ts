/**
 * The single wording for what `Șterge ONG` does, shared by the FDSC list action
 * and by the Admin ONG's own Acțiuni menu, so the two can never drift apart.
 *
 * Deliberately short: the backend (`buildAnonymizedOngData` in
 * `src/api/ong/services/delete-ong.ts`) clears thirteen fields, but a confirm
 * dialog that lists them all stops being read. It names the consequences —
 * data gone, org withdrawn, members out, history kept — not the columns.
 */
export function buildOngDeletionWarning(ongName: string): string {
  return (
    `Datele organizației „${ongName}” sunt șterse definitiv, iar organizația rămâne ` +
    `în program marcată ca retrasă. Membrii ies din organizație, iar invitațiile ` +
    `în curs se anulează. Evaluările rămân în istoricul programului. ` +
    `Acțiunea nu poate fi anulată.`
  );
}
