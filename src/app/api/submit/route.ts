import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../lib/auth';
import { saveSubmission } from '../../../lib/googleSheets';

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { round, link } = body as { round: 1 | 2 | 3; link: string };

    if (!round || !link) {
        return NextResponse.json({ error: 'round and link are required' }, { status: 400 });
    }

    const drivePattern = /^https:\/\/(drive|docs)\.google\.com\//;
    if (!drivePattern.test(link)) {
        return NextResponse.json({ error: 'Only Google Drive links are accepted' }, { status: 400 });
    }

    try {
        await saveSubmission(session.user.email, round, link);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[submit]', err);
        return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 });
    }
}
