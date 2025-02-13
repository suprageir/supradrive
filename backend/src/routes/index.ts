const supradriveauth = require("src/middleware/supradriveauth");
import { Router } from 'express';
import { SupraDriveAuthLogin, SupraDriveAuthToken, SupraDriveNewFolder, SupraDriveGetFolders, SupraDriveEncryptedTextSave, SupraDriveGetFile, SupraDriveEncryptedTextUpload, SupraDriveNewImagesFolder, SupraDriveGetImagesFolder, SupraDriveNewImagesUpload, SupraDriveGetImage } from './supradrive';

import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const apiRouter = Router();

// supradrive
apiRouter.post('/supradrive/auth/login', SupraDriveAuthLogin);
apiRouter.get('/supradrive/auth/token', supradriveauth, SupraDriveAuthToken);
apiRouter.post('/supradrive/encrypted/folder', supradriveauth, SupraDriveNewFolder);
apiRouter.post('/supradrive/encryptedtextfile', supradriveauth, SupraDriveEncryptedTextSave);
apiRouter.post('/supradrive/encrypted/uploadtxtfiles', supradriveauth, upload.single('file'), SupraDriveEncryptedTextUpload);
apiRouter.get('/supradrive/encrypted/folder/:foldersysid', supradriveauth, SupraDriveGetFolders);
apiRouter.get('/supradrive/encrypted/file/:fileid', supradriveauth, SupraDriveGetFile);
apiRouter.post('/supradrive/images/folder', supradriveauth, SupraDriveNewImagesFolder);
apiRouter.post('/supradrive/images/upload', supradriveauth, upload.single('file'), SupraDriveNewImagesUpload);
apiRouter.get('/supradrive/image/:fileid', supradriveauth, SupraDriveGetImage);
apiRouter.get('/supradrive/images/folder/:foldersubid', supradriveauth, SupraDriveGetImagesFolder);

// Export the base-router
const baseRouter = Router();
baseRouter.use('/', apiRouter);
export default baseRouter;