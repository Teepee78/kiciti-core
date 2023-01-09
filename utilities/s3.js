import AWS from 'aws-sdk';
import dotenv from "dotenv";
import fs from 'fs';

dotenv.config();

const S3 = AWS.S3;

const bucket = process.env.KICITI_BUCKET;
const region = process.env.KICITI_BUCKET_REGION;
const accessKeyId = process.env.KICITI_S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.KICITI_S3_SECRET_ACCESS_KEY;

const s3 = new S3({
	region,
	accessKeyId,
	secretAccessKey
});

async function uploadPfp(user_id, pfp) {
  const path = `./${pfp.path}`;
	const uploadParams = {
    Bucket: bucket,
    Body: fs.readFileSync(path),
    Key: `pfp-${user_id}.jpg`
  };

  return s3.upload(uploadParams).promise();
}

async function downloadPfp(user_id) {
  const downloadParams = {
    Key: `pfp-${user_id}.jpg`,
    Bucket: bucket
  };

  return s3.getObject(downloadParams).promise();
}

async function deletePfp(user_id) {
  const params = {
    Key: `pfp-${user_id}.jpg`,
    Bucket: bucket
  };

  return s3.deleteObject(params).promise();
}

export { uploadPfp, downloadPfp, deletePfp };
