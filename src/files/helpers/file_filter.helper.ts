export const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error, acceptFile: boolean) => void,
): void => {
  if (!file) return callback(new Error('File is empty'), false);
  const fileExptension = file.mimetype.split('/')[1];
  const validFiles = ['mp4'];
  if (validFiles.includes(fileExptension)) return callback(null, true);
  callback(null, false);
};
