# Build
`yarn build` as per default.

# Deploy
Set GUI_BUCKET_NAME and DISTRIBUTION_ID (Cloudfront ID), run `yarn deploy`.

# Env Vars
Per default, `process.env.REACT_APP_LOCAL` is set to `"true"` (as string) when app is started locally.
Useful for doing some API shenanigans.
