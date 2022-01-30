export const insertEvent = (subject: string, body: any, r: any) =>
    r.insert({
        subject,
        body,
        ingestedAt: new Date()
    })
