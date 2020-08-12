export const parseCookieString: (cookieString: string) => { [key: string]: string | undefined } = (cookieString: string) =>
    Object.fromEntries(cookieString
        .split(";")
        .map(curr => {
                const firstEquals = curr.indexOf("=")
                if (firstEquals === -1)
                    return []
                return ([ curr.slice(0, firstEquals), curr.slice(firstEquals + 1) ]).map(token => token.trim())
            }
        )
    )
