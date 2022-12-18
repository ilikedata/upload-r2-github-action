# Upload R2

A small action to upload assets to Cloudflare's R2 bucket.

## Inputs

`account_id` - The account ID of the Cloudflare account to upload to.

`access_key_id` - The access key ID for the Cloudflare API Token.

`secret_access_key` - The access key secret for the Cloudflare API Token.

`bucket` - The name of the bucket to upload to.

`source_dir` - The directory to upload.

`destination_dir` - The directory to upload to. Defaults to the root of the bucket.
