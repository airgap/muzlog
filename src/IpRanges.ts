export class IpRanges {
    static readonly local = [
        "127.0.0.0/8",
        "::1/128",
        "::ffff:127.0.0.1/72"
    ]
    static readonly all = [
        "0.0.0.0/0",
        "::1/0"
    ]
}