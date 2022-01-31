export const insertEvent = (subject: string, body: any, r: any) =>
    r.table('Events').insert({
        subject,
        body,
        ingestedAt: new Date()
    });
