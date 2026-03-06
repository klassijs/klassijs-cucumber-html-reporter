import fs from 'fs-extra';
import path from 'path';

export default function searchFileUp(fileName) {
  const pathParts = process.cwd().split(path.sep);

  let filePath = pathParts.concat([fileName]).join(path.sep);

  while (!exists(filePath) && pathParts.length) {
    pathParts.pop();
    filePath = pathParts.concat([fileName]).join(path.sep);
  }

  return filePath;
}

function exists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch (err) {
    return false;
  }
}
