// Production stub — dev-only mock routes are replaced with this during `next build`.
// The real PHP API handles all requests in production.
export const dynamic = 'force-static';

export function GET()    { return Response.json({ error: 'dev-only' }, { status: 410 }); }
export function POST()   { return Response.json({ error: 'dev-only' }, { status: 410 }); }
export function PUT()    { return Response.json({ error: 'dev-only' }, { status: 410 }); }
export function DELETE() { return Response.json({ error: 'dev-only' }, { status: 410 }); }
