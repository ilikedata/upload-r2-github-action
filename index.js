const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const core = require("@actions/core");
const klawSync = require("klaw-sync");

const ACCOUNT_ID = core.getInput("account_id", {
  required: true,
});
const ACCESS_KEY_ID = core.getInput("access_key_id", {
  required: true,
});
const SECRET_ACCESS_KEY = core.getInput("secret_access_key", {
  required: true,
});
const BUCKET_NAME = core.getInput("bucket", {
  required: true,
});
const SOURCE_DIR = core.getInput("source_dir", {
  required: true,
});
const DESTINATION_DIR = core.getInput("destination_dir", {
  required: false,
});

const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

const destinationDir = DESTINATION_DIR ?? "/";

function upload(params) {
  return new Promise((resolve) => {
    S3.send(new PutObjectCommand({ Bucket: BUCKET_NAME, Key: params }));
  });
}

const paths = klawSync(newdir, {
  nodir: true,
});

async function main() {
  const sourceDir = path.join(process.cwd(), SOURCE_DIR);

  return Promise.all(
    paths.map(async (p) => {
      const fileStream = fs.createReadStream(p.path);
      const bucketPath = path.join(
        destinationDir,
        path.relative(sourceDir, p.path)
      );
      const signedUrl = await getSignedUrl(
        S3,
        new PutObjectCommand({
          Bucket: process.env.BUCKET_NAME,
          Key: bucketPath,
        }),
        { expiresIn: 3600 }
      );

      const params = {
        Bucket: BUCKET,
        ACL: "public-read",
        Body: fileStream,
        Key: bucketPath,
        ContentType: lookup(p.path) || "text/plain",
      };
      return upload(params);
    })
  );
}

main()
  .then((locations) => {
    core.info(`object key - ${destinationDir}`);
    core.info(`object locations - ${locations}`);
    core.setOutput("object_key", destinationDir);
    core.setOutput("object_locations", locations);
  })
  .catch((err) => {
    core.error(err);
    core.setFailed(err.message);
  });
