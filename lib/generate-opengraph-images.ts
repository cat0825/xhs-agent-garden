import { createHash } from 'crypto';
import fs from 'fs';

type OgImageParams = Record<string, string | undefined>;

const OGImageDirectory = `./public/static/og`;
// Must be a public URL path, not a filesystem path: callers prefix the origin.
const defaultOGImage = `/static/og/main-og-image.png`;

const getOgImage = async (params: OgImageParams): Promise<string> => {
  const hash = createHash('md5')
    .update(params.title || '')
    .digest('hex');
  const imagePath = `${OGImageDirectory}/${hash}.png`;
  const publicPath = `/static/og/${hash}.png`;

  try {
    fs.statSync(imagePath);
    return publicPath;
  } catch {
    return defaultOGImage;
  }
};

export default getOgImage;
