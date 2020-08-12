export interface Cookie {
    name: string
    value: string
    domain?: string
    path?: string
    httpOnly?: boolean
    secure?: boolean
}
