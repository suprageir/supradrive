const supradriveauth = require("src/middleware/supradriveauth");
import { Router } from 'express';
import { SupraDriveAuthLogin, SupraDriveAuthToken, SupraDriveNewFolder, SupraDriveGetFolders, SupraDriveGetVideosFolder, SupraDriveEncryptedTextSave, SupraDriveGetFile, SupraDriveEncryptedTextUpload, SupraDriveNewImagesFolder, SupraDriveNewVideosFolder, SupraDriveGetImagesFolder, SupraDriveNewImagesUpload, SupraDriveNewVideosUpload, SupraDriveGetImage, SupraDriveGetVideo, SupraDriveGetImageTags, SupraDriveGetImageUserTags, SupraDriveAddImageTag, SupraDriveRemoveImageTag, SupraDriveAddImageUserTag, SupraDriveRemoveImageUserTag, SupraDriveGetImageLocationTags, SupraDriveAddImageLocationTag, SupraDriveRemoveImageLocationTag, SupraDriveGetMusicFolder, SupraDriveNewMusicFolder, SupraDriveNewMusicUpload, SupraDriveGetMusic } from './supradrive';

import multer from 'multer';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/supradrive/temp/'); // Save files to 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`); // Unique filenames
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 * 1024, // 100GB file size limit
  },
});

const uploadimage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 * 1024, // 100GB file size limit
  },
});

const apiRouter = Router();

// supradrive
apiRouter.post('/supradrive/auth/login', SupraDriveAuthLogin);
apiRouter.get('/supradrive/auth/token', supradriveauth, SupraDriveAuthToken);
apiRouter.post('/supradrive/encrypted/folder', supradriveauth, SupraDriveNewFolder);
apiRouter.post('/supradrive/encryptedtextfile', supradriveauth, SupraDriveEncryptedTextSave);
apiRouter.post('/supradrive/encrypted/uploadtxtfiles', supradriveauth, upload.single('file'), SupraDriveEncryptedTextUpload);
apiRouter.get('/supradrive/encrypted/folder/:foldersysid', supradriveauth, SupraDriveGetFolders);
apiRouter.get('/supradrive/encrypted/textfile/:fileid', supradriveauth, SupraDriveGetFile);

apiRouter.post('/supradrive/images/folder', supradriveauth, SupraDriveNewImagesFolder);
apiRouter.post('/supradrive/images/upload', supradriveauth, uploadimage.single('file'), SupraDriveNewImagesUpload);
apiRouter.get('/supradrive/image/:fileid', supradriveauth, SupraDriveGetImage);
apiRouter.get('/supradrive/images/folder/:foldersubid', supradriveauth, SupraDriveGetImagesFolder);
apiRouter.get('/supradrive/images/tags', supradriveauth, SupraDriveGetImageTags);
apiRouter.post('/supradrive/images/tag/:imageid', supradriveauth, SupraDriveAddImageTag);
apiRouter.delete('/supradrive/images/tag/:imageid/:tagid', supradriveauth, SupraDriveRemoveImageTag);
apiRouter.get('/supradrive/images/usertags', supradriveauth, SupraDriveGetImageUserTags);
apiRouter.post('/supradrive/images/usertag/:imageid', supradriveauth, SupraDriveAddImageUserTag);
apiRouter.delete('/supradrive/images/usertag/:imageid/:tagid', supradriveauth, SupraDriveRemoveImageUserTag);
apiRouter.get('/supradrive/images/locationtags', supradriveauth, SupraDriveGetImageLocationTags);
apiRouter.post('/supradrive/images/locationtag/:imageid', supradriveauth, SupraDriveAddImageLocationTag);
apiRouter.delete('/supradrive/images/locationtag/:imageid/:tagid', supradriveauth, SupraDriveRemoveImageLocationTag);


apiRouter.get('/supradrive/videos/folder/:foldersubid', supradriveauth, SupraDriveGetVideosFolder);
apiRouter.post('/supradrive/videos/folder', supradriveauth, SupraDriveNewVideosFolder);
apiRouter.post('/supradrive/videos/upload', supradriveauth, upload.single('file'), SupraDriveNewVideosUpload);
apiRouter.get('/supradrive/video/:fileid', supradriveauth, SupraDriveGetVideo);

apiRouter.get('/supradrive/music/folder/:foldersubid', supradriveauth, SupraDriveGetMusicFolder);
apiRouter.post('/supradrive/music/folder', supradriveauth, SupraDriveNewMusicFolder);
apiRouter.post('/supradrive/music/upload', supradriveauth, upload.single('file'), SupraDriveNewMusicUpload);
apiRouter.get('/supradrive/music/:fileid', supradriveauth, SupraDriveGetMusic);




// Export the base-router
const baseRouter = Router();
baseRouter.use('/', apiRouter);
export default baseRouter;