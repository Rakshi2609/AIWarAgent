import { NextResponse } from 'next/server';
import { getLeaderboard } from '../../../lib/googleSheets';

export async function GET() {
    try {
        const entries = await getLeaderboard();
        return NextResponse.json(entries);
    } catch (err) {
        console.error('[leaderboard]', err);
        // Return mock data so UI still renders when Sheets not connected
        return NextResponse.json([]);
    }
}
