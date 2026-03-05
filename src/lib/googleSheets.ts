import { google } from 'googleapis';
import { Team, LeaderboardEntry, ScoreBreakdown, RoundScore } from '../types';

// ─── Auth ──────────────────────────────────────────────────────────────────────
function getAuth() {
    return new google.auth.JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
}

function getSheets() {
    return google.sheets({ version: 'v4', auth: getAuth() });
}

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;

// ─── Helpers ───────────────────────────────────────────────────────────────────
function num(v: string | undefined | null): number {
    const n = parseFloat(v ?? '0');
    return isNaN(n) ? 0 : n;
}

// ─── Read registered teams (for auth check) ────────────────────────────────────
export async function getRegisteredTeams(): Promise<Team[]> {
    const sheets = getSheets();
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'Teams!A2:C',
    });
    const rows = res.data.values ?? [];
    return rows.map((r) => ({
        teamName: r[0] ?? '',
        leaderName: r[1] ?? '',
        email: (r[2] ?? '').toLowerCase().trim(),
    }));
}

// ─── Register new team ───────────────────────────────────────────────────────────
export async function registerTeam(data: { teamName: string; leaderName: string; email: string; members?: string[] }): Promise<void> {
    const teams = await getRegisteredTeams();
    if (teams.some(t => t.email === data.email.toLowerCase().trim())) {
        throw new Error('Email already registered');
    }

    const sheets = getSheets();
    const row = [
        data.teamName,
        data.leaderName,
        data.email.toLowerCase().trim(),
        ...(data.members || [])
    ];

    await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: 'Teams!A:F',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [row] },
    });
}

// ─── Get leaderboard ───────────────────────────────────────────────────────────
// Scores sheet columns:
// A: TeamName | B-E: R1(Arch,Innov,Tech,Pres) | F: R1Total
// G-J: R2(Arch,Innov,Tech,Pres) | K: R2Total
// L-O: R3(Arch,Innov,Tech,Pres) | P: R3Total | Q: GrandTotal
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
    const sheets = getSheets();
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'Scores!A2:Q',
    });
    const rows = res.data.values ?? [];

    const entries: LeaderboardEntry[] = rows
        .filter((r) => r[0])
        .map((r) => ({
            rank: 0,
            teamName: r[0],
            r1: num(r[5]),
            r2: num(r[10]),
            r3: num(r[15]),
            total: num(r[16]),
        }))
        .sort((a, b) => b.total - a.total)
        .map((e, i) => ({ ...e, rank: i + 1 }));

    return entries;
}

// ─── Get team score breakdown ──────────────────────────────────────────────────
export async function getTeamScores(email: string): Promise<ScoreBreakdown | null> {
    const teams = await getRegisteredTeams();
    const team = teams.find((t) => t.email === email.toLowerCase().trim());
    if (!team) return null;

    const sheets = getSheets();
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'Scores!A2:Q',
    });
    const rows = res.data.values ?? [];
    const row = rows.find((r) => (r[0] ?? '').toLowerCase() === team.teamName.toLowerCase());
    if (!row) return { teamName: team.teamName, rounds: [], grandTotal: 0 };

    const rounds: RoundScore[] = [
        {
            round: 1,
            criteria: { architecture: num(row[1]), innovation: num(row[2]), technical: num(row[3]), presentation: num(row[4]) },
            total: num(row[5]),
        },
        {
            round: 2,
            criteria: { architecture: num(row[6]), innovation: num(row[7]), technical: num(row[8]), presentation: num(row[9]) },
            total: num(row[10]),
        },
        {
            round: 3,
            criteria: { architecture: num(row[11]), innovation: num(row[12]), technical: num(row[13]), presentation: num(row[14]) },
            total: num(row[15]),
        },
    ];

    return { teamName: team.teamName, rounds, grandTotal: num(row[16]) };
}

// ─── Save submission link ──────────────────────────────────────────────────────
// Submissions sheet: A: TeamName | B: Round1Link | C: Round2Link | D: Round3Link
export async function saveSubmission(email: string, round: 1 | 2 | 3, link: string): Promise<void> {
    const teams = await getRegisteredTeams();
    const team = teams.find((t) => t.email === email.toLowerCase().trim());
    if (!team) throw new Error('Team not found');

    const sheets = getSheets();
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'Submissions!A2:D',
    });
    const rows = res.data.values ?? [];
    const rowIndex = rows.findIndex((r) => (r[0] ?? '').toLowerCase() === team.teamName.toLowerCase());

    const colMap: Record<number, string> = { 1: 'B', 2: 'C', 3: 'D' };
    const col = colMap[round];

    if (rowIndex === -1) {
        // Create new row
        const blankRow = ['', '', '', ''];
        blankRow[0] = team.teamName;
        blankRow[round] = link;
        await sheets.spreadsheets.values.append({
            spreadsheetId: SHEET_ID,
            range: 'Submissions!A2:D',
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [blankRow] },
        });
    } else {
        // Update existing cell
        const sheetRow = rowIndex + 2;
        await sheets.spreadsheets.values.update({
            spreadsheetId: SHEET_ID,
            range: `Submissions!${col}${sheetRow}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [[link]] },
        });
    }
}

// ─── Get team submissions ──────────────────────────────────────────────────────
export async function getTeamSubmissions(email: string): Promise<Record<1 | 2 | 3, string>> {
    const teams = await getRegisteredTeams();
    const team = teams.find((t) => t.email === email.toLowerCase().trim());
    const empty = { 1: '', 2: '', 3: '' } as Record<1 | 2 | 3, string>;
    if (!team) return empty;

    const sheets = getSheets();
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'Submissions!A2:D',
    });
    const rows = res.data.values ?? [];
    const row = rows.find((r) => (r[0] ?? '').toLowerCase() === team.teamName.toLowerCase());
    if (!row) return empty;

    return { 1: row[1] ?? '', 2: row[2] ?? '', 3: row[3] ?? '' };
}
