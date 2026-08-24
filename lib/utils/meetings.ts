import type { OngMeeting } from "@/lib/api/meetings";

/** Earliest still-`programata` meeting whose `dataOra` hasn't passed yet, if any. */
export function pickNextMeeting(meetings: OngMeeting[]): OngMeeting | undefined {
  const now = Date.now();
  return meetings
    .filter((meeting) => new Date(meeting.dataOra).getTime() >= now)
    .sort((a, b) => new Date(a.dataOra).getTime() - new Date(b.dataOra).getTime())[0];
}
