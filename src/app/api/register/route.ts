import { NextResponse } from 'next/server';
import { registerTeam } from '../../../lib/googleSheets';

export async function POST(req: Request) {
    try {
        const data = await req.json();

        if (!data.teamName || !data.leaderName || !data.email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await registerTeam(data);
        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('[register]', err);
        return NextResponse.json({ error: err.message ?? 'Registration failed' }, { status: 500 });
    }
}
