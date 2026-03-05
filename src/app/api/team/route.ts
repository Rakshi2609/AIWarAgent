import { NextResponse } from 'next/server';
import { auth } from '../../../lib/auth';
import { getTeamScores, getTeamSubmissions } from '../../../lib/googleSheets';

export async function GET() {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const [scores, submissions] = await Promise.all([
            getTeamScores(session.user.email),
            getTeamSubmissions(session.user.email),
        ]);
        return NextResponse.json({ scores, submissions });
    } catch (err) {
        console.error('[team]', err);
        return NextResponse.json({ error: 'Failed to fetch team data' }, { status: 500 });
    }
}
