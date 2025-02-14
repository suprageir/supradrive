require('dotenv').config();
import { SupraDrive } from "src/models/supradrive.model";
var crypto = require("crypto");
const moment = require('moment');
const supradrive = require('../shared/supradrive');
import * as fs from 'fs';
import * as path from 'path';
const sharp = require('sharp');
import ExifParser from 'exif-parser';
import { APIResponse } from "@shared/APIResponse";

async function createThumbnail(fileBuffer) {
    try {
        const thumbnailBuffer = await sharp(fileBuffer)
            .rotate()
            .resize({ width: 300, height: 300, fit: 'cover' }) // Resize and maintain aspect ratio
            .toBuffer();

        return thumbnailBuffer;
    } catch (error) {
        console.error('Error creating thumbnail:', error);
        throw error;
    }
}

const SUPRADRIVE_PATH = process.env.SUPRADRIVE_PATH || '';

export abstract class sqlSupraDrive {

    public static async SupraDriveFolderNew(userid: number, username: string, body: any): Promise<any> {
        let foldersysid = body.foldersysid;
        let foldername = body.foldername;
        let foldersubid = body.foldersubid || null;
        let foldersalt = JSON.stringify(body.foldersalt);
        let folderiv = JSON.stringify(body.folderiv);

        try {
            const query = `INSERT INTO foldersencrypted (foldersysid, folderuserid, foldername, foldersubid, foldersalt, folderiv) VALUES (?, ?, ?, ?, ?, ?)`;
            const values = [foldersysid, userid, foldername, foldersubid, foldersalt, folderiv];
            await supradrive.query(query, values);
            return APIResponse("success", 200, "Folder " + foldername + " created successfully", "", null);
        } catch (e: any) {
            console.log(e);
            return APIResponse("error", 500, "Folder creation failed", e.message, null);
        }
    }

    public static async SupraDriveNewImagesFolder(userid: number, username: string, body: any): Promise<any> {
        let foldersysid = body.foldersysid;
        let foldersubid = body.foldersubid || null;
        let foldername = body.foldername;

        try {
            const query = `INSERT INTO foldersimages (foldersubid, folderuserid, foldername) VALUES (?, ?, ?)`;
            const values = [foldersubid, userid, foldername];
            await supradrive.query(query, values);
            return APIResponse("success", 200, "Folder " + foldername + " created successfully", "", null);
        } catch (e: any) {
            console.log(e);
            return APIResponse("error", 500, "Folder creation failed", e.message, null);
        }
    }


    public static async SupraDriveEncryptedTextSave(userid: number, username: string, body: any): Promise<SupraDrive[]> {
        const timestamp = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
        const ts = Math.floor(Date.now() / 1000);
        const folderid = body.folderid;
        var filename = body.filename;
        let filenameiv = JSON.stringify(body.filenameiv);
        let filenamesalt = JSON.stringify(body.filenamesalt);
        let filesalt = JSON.stringify(body.salt);
        let fileiv = JSON.stringify(body.iv);
        let filecontent = body.content;
        let filenamedisk = crypto.createHash('sha1').update(body.content).digest('hex');
        let filesha1 = body.filesha1;
        var fileidref = body.fileid || null;

        const userDir = path.join(SUPRADRIVE_PATH, 'userdata', username);

        if (!fs.existsSync(path.join(userDir, 'encrypted', 'text'))) {
            fs.mkdirSync(path.join(userDir, 'encrypted', 'text'), { recursive: true });
        }

        const folderDir = path.join(userDir, 'encrypted', 'text', `${folderid}`);

        if (!fs.existsSync(folderDir)) {
            fs.mkdirSync(folderDir, { recursive: true });
        }

        const filePath = path.join(folderDir, `${filenamedisk}.txt`);
        const metaPath = path.join(folderDir, `${filenamedisk}.json`);

        // check if file already is saved
        if (fs.existsSync(filePath)) {
            return [];
        }

        // check if older revision of file is saved
        var olderid = 0;
        var olderfilenamedisk = "";
        var olderfilenamefolder = 0;
        if (fileidref) {
            try {
                var [sqlorgid] = await supradrive.query(`SELECT f.fileid, f.fileidref, f.filets, f.folderid, f.filenamedisk, f.userid, f.filename, f.filenamesalt, f.filenameiv, f.salt, f.iv FROM filesencrypted f WHERE f.userid = ? AND f.wiped = '0' AND f.fileid = ? AND f.fileid = (SELECT MAX(f2.fileid) FROM filesencrypted f2 WHERE (f2.fileidref = f.fileidref OR f2.fileid = f.fileidref OR f2.fileid = f.fileid)) AND NOT EXISTS (SELECT 1 FROM filesencrypted f3 WHERE f3.fileidref = f.fileid)`, [userid, fileidref]);
                if (sqlorgid.length > 0) {
                    olderid = sqlorgid[0].fileid;
                    olderfilenamedisk = sqlorgid[0].filenamedisk;
                    olderfilenamefolder = sqlorgid[0].folderid;
                }
            } catch (e) {
                console.log(e);
            }
        }

        // move older revision of file to _old folder
        if (olderid > 0) {
            const folderOldDir = path.join(userDir, `${olderfilenamefolder}`);
            if (!fs.existsSync(folderOldDir)) {
                fs.mkdirSync(folderOldDir, { recursive: true });
            }
            const folderOldDirMoved = path.join(folderOldDir, "_old");
            if (!fs.existsSync(folderOldDirMoved)) {
                fs.mkdirSync(folderOldDirMoved, { recursive: true });
            }

            const filePathOld = path.join(folderOldDir, `${olderfilenamedisk}.txt`);
            const metaPathOld = path.join(folderOldDir, `${olderfilenamedisk}.json`);

            fs.renameSync(filePathOld, path.join(folderOldDirMoved, `${olderfilenamedisk}.txt`));
            fs.renameSync(metaPathOld, path.join(folderOldDirMoved, `${olderfilenamedisk}.json`));
        }

        // save new file
        fs.writeFileSync(filePath, filecontent, 'utf8');

        const metadata = { filename: filename, filenameiv: filenameiv, filenamesalt: filenamesalt, iv: fileiv, salt: filesalt, timestamp: timestamp, ts: ts };
        fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 4), 'utf8');

        // check if fileidref is a reference to another file
        var fileidorg = null;
        if (fileidref) {
            try {
                var [sqlorgid] = await supradrive.query(`SELECT fileidref FROM \`filesencrypted\` WHERE fileid=? AND userid=?`, [fileidref, userid]);
                if (sqlorgid.length > 0) {
                    fileidorg = sqlorgid[0].fileidref;
                }
            } catch (e) {
                console.log(e);
            }
        }
        if (fileidorg && fileidorg !== null) {
            fileidref = fileidorg;
        }

        try {
            const query = `INSERT INTO filesencrypted (filets, fileidref, folderid, userid, filename, filenamesalt, filenameiv, filenamedisk, filesha1, salt, iv) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const values = [ts, fileidref, folderid, userid, filename, filenamesalt, filenameiv, filenamedisk, filesha1, filesalt, fileiv];
            await supradrive.query(query, values);

        } catch (e) {
            console.log(e);
        }

        return [];

    }





    public static async SupraDriveEncryptedTextUpload(userid: number, username: string, body: any, file: any): Promise<SupraDrive[]> {
        const timestamp = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
        const ts = Math.floor(Date.now() / 1000);

        const folderid = body.folderid;
        const filename = file.originalname;
        let filenameiv = body.filenameiv;
        let filenamesalt = body.filenamesalt;
        let filesalt = body.salt;
        let fileiv = body.iv;
        let filecontent = file.buffer;
        let filenamedisk = crypto.createHash('sha1').update(file.buffer).digest('hex');
        let filesha1 = body.filesha1;
        var fileidref = body.fileid || null;

        const userDir = path.join(SUPRADRIVE_PATH, 'userdata', username);

        if (!fs.existsSync(path.join(userDir, 'encrypted', 'text'))) {
            fs.mkdirSync(path.join(userDir, 'encrypted', 'text'), { recursive: true });
        }

        const folderDir = path.join(userDir, 'encrypted', 'text', `${folderid}`);

        if (!fs.existsSync(folderDir)) {
            fs.mkdirSync(folderDir, { recursive: true });
        }

        const filePath = path.join(folderDir, `${filenamedisk}.txt`);
        const metaPath = path.join(folderDir, `${filenamedisk}.json`);

        // check if file already is saved
        if (fs.existsSync(filePath)) {
            return [];
        }

        // save new file
        fs.writeFileSync(filePath, filecontent, 'utf8');

        const metadata = { filename: filename, filenameiv: filenameiv, filenamesalt: filenamesalt, iv: fileiv, salt: filesalt, timestamp: timestamp, ts: ts };
        fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 4), 'utf8');

        try {
            const query = `INSERT INTO filesencrypted (filets, fileidref, folderid, userid, filename, filenamesalt, filenameiv, filenamedisk, filesha1, salt, iv) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const values = [ts, fileidref, folderid, userid, filename, filenamesalt, filenameiv, filenamedisk, filesha1, filesalt, fileiv];
            await supradrive.query(query, values);

        } catch (e) {
            console.log(e);
        }

        return [];

    }

    public static async SupraDriveNewImagesUpload(userid: number, username: string, body: any, file: any): Promise<SupraDrive[]> {
        const timestamp = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
        const ts = Math.floor(Date.now() / 1000);
        const folderid = body.folderid;
        const filename = file.originalname;
        let filecontent = file.buffer;
        let filesha1 = crypto.createHash('sha1').update(file.buffer).digest('hex');
        let created = body.created || null;

        const userDir = path.join(SUPRADRIVE_PATH, 'userdata', username);
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }
        const imagesDir = path.join(userDir, 'images');
        if (!fs.existsSync(imagesDir)) {
            fs.mkdirSync(imagesDir, { recursive: true });
        }
        const folderDir = path.join(imagesDir, `${folderid}`);
        if (!fs.existsSync(folderDir)) {
            fs.mkdirSync(folderDir, { recursive: true });
        }
        const filePath = path.join(folderDir, `${filename}.jpg`);
        const metaPath = path.join(folderDir, `${filename}.json`);

        // check if file already is saved
        // if (fs.existsSync(filePath)) {
        //     return [];
        // }

        // save new file
        fs.writeFileSync(filePath, filecontent);

        const thumbnailBuffer = await createThumbnail(filecontent);
        const thumbnailPath = path.join(folderDir, `${filename}.thumb`);
        fs.writeFileSync(thumbnailPath, thumbnailBuffer);


        // Extract metadata using Sharp
        let imageMetadata: any = {};
        try {
            imageMetadata = await sharp(filecontent).metadata();
        } catch (err) {
            console.error("Error extracting metadata with sharp:", err);
        }

        // Extract EXIF data
        let exifData: any = {};
        try {
            const parser = ExifParser.create(filecontent);
            exifData = parser.parse().tags;
        } catch (err) {
            console.error("Error extracting EXIF metadata:", err);
        }

        // Merge metadata
        const metadata = {
            filename: filename,
            timestamp: timestamp,
            ts: ts,
            width: imageMetadata.width,
            height: imageMetadata.height,
            format: imageMetadata.format,
            size: imageMetadata.size,
            imageMetadata: imageMetadata,
            exif: exifData,
        };

        let metamake = exifData.Make || null;
        let metamodel = exifData.Model || null;
        let metaiso = exifData.ISO || null;
        let metamodifydate = exifData.ModifyDate || null;
        let metafnumber = exifData.FNumber || null;
        let metacreatedate = exifData.DateTimeOriginal || null;
        let metadatetimeoriginal = exifData.DateTimeOriginal || null;
        let imagemetasoftware = exifData.Software || null;

        let imagedatetime = null;
        if (metacreatedate && metacreatedate !== null && metacreatedate !== undefined) {
            imagedatetime = moment.unix(parseInt(metacreatedate)).format("YYYY-MM-DD HH:mm:ss");
        }
        if (!imagedatetime && metadatetimeoriginal && metadatetimeoriginal !== null && metadatetimeoriginal !== undefined) {
            imagedatetime = moment.unix(parseInt(metadatetimeoriginal)).format("YYYY-MM-DD HH:mm:ss");
        }

        fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 4), 'utf8');


        try {
            const query = `INSERT INTO filesimages (imagefolderid, imageuserid, imagesha1, imagefilename, imageformat, imagedatetime, imagefiledatetime, imageheight, imagewidth, imagemetamake, imagemetamodel, imagemetasoftware, imagemetadatetime, imagemetafnumber, imagemetadatetimeoriginal, imagemetajson) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const values = [folderid, userid, filesha1, filename, imageMetadata.format, imagedatetime, created, imageMetadata.height, imageMetadata.width, metamake, metamodel, imagemetasoftware, metacreatedate, metafnumber, metacreatedate, JSON.stringify(exifData, null, 4)];
            await supradrive.query(query, values);

        } catch (e) {
            console.log(e);
        }

        return [];

    }

    public static async getFolders(userid: number, username: string, foldersysid: number): Promise<SupraDrive[]> {
        if (foldersysid === 0) {
            try {
                var [folders] = await supradrive.query(`SELECT folderid,foldersysid,foldersubid,foldername,foldersalt,folderiv FROM \`foldersencrypted\` WHERE foldersubid IS NULL AND folderuserid=? AND folderwiped='0'`, [userid]);
            } catch (e) {
                console.log(e);
            }

            try {
                var [files] = await supradrive.query(`SELECT f.fileid, f.fileidref, f.filets, f.folderid, f.userid, f.filename, f.filenamesalt, f.filenameiv, f.salt, f.iv FROM filesencrypted f WHERE f.folderid = ? AND f.userid = ? AND f.wiped = '0' AND f.fileid = (SELECT MAX(f2.fileid) FROM filesencrypted f2 WHERE (f2.fileidref = f.fileidref OR f2.fileid = f.fileidref OR f2.fileid = f.fileid)) AND NOT EXISTS (SELECT 1 FROM filesencrypted f3 WHERE f3.fileidref = f.fileid)`, [foldersysid, userid]);
            } catch (e) {
                console.log(e);
            }

        }
        else {
            try {
                var [folders] = await supradrive.query(`SELECT folderid,foldersysid,foldersubid,foldername,foldersalt,folderiv FROM \`foldersencrypted\` WHERE foldersubid=? AND folderuserid=? AND folderwiped='0'`, [foldersysid, userid]);
            } catch (e) {
                console.log(e);
            }

            try {
                var [files] = await supradrive.query(`SELECT f.fileid, f.fileidref, f.filets, f.folderid, f.userid, f.filename, f.filenamesalt, f.filenameiv, f.salt, f.iv FROM filesencrypted f WHERE f.folderid = ? AND f.userid = ? AND f.wiped = '0' AND f.fileid = (SELECT MAX(f2.fileid) FROM filesencrypted f2 WHERE (f2.fileidref = f.fileidref OR f2.fileid = f.fileidref OR f2.fileid = f.fileid)) AND NOT EXISTS (SELECT 1 FROM filesencrypted f3 WHERE f3.fileidref = f.fileid)`, [foldersysid, userid]);
            } catch (e) {
                console.log(e);
            }

        }

        const res = [{ folders, files }];

        let SupraDrive = res.map((r: any) => {
            return <SupraDrive>r;
        })
        return SupraDrive;
    }


    public static async SupraDriveGetImagesFolder(userid: number, username: string, foldersubid: number): Promise<SupraDrive[]> {
        if (foldersubid === 0) {
            try {
                var [folders] = await supradrive.query(`SELECT folderid,foldersubid,folderuserid,foldername FROM \`foldersimages\` WHERE foldersubid IS NULL AND folderuserid=? AND folderwiped='0'`, [userid]);
            } catch (e) {
                console.log(e);
            }

            try {
                var [files] = await supradrive.query(`SELECT * FROM filesimages i WHERE i.imagefolderid = ? AND i.imageuserid = ? AND i.imagewiped = '0'`, [foldersubid, userid]);

                files = files.map(file => {

                    // const imagepath = path.join(SUPRADRIVE_PATH, 'userdata', username, 'images', file.imagefolderid, `${file.imagefilename}.jpg`);
                    const thumbnailpath = path.join(SUPRADRIVE_PATH, 'userdata', username, 'images', file.imagefolderid.toString(), `${file.imagefilename}.thumb`);

                    let base64Thumbnail = "";
                    try {
                        if (fs.existsSync(thumbnailpath)) {
                            const imageBuffer = fs.readFileSync(thumbnailpath);
                            base64Thumbnail = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
                        }
                    } catch (error) {
                        console.error(`Error reading thumbnail: ${thumbnailpath}`, error);
                    }

                    return { ...file, base64Thumbnail };
                });


            } catch (e) {
                console.log(e);
            }

        }
        else {
            try {
                var [folders] = await supradrive.query(`SELECT folderid,foldersubid,folderuserid,foldername FROM \`foldersimages\` WHERE foldersubid=? AND folderuserid=? AND folderwiped='0'`, [foldersubid, userid]);
            } catch (e) {
                console.log(e);
            }

            try {
                var [files] = await supradrive.query(`SELECT * FROM filesimages i WHERE i.imagefolderid = ? AND i.imageuserid = ? AND i.imagewiped = '0'`, [foldersubid, userid]);


                files = files.map(file => {

                    // const imagepath = path.join(SUPRADRIVE_PATH, 'userdata', username, 'images', file.imagefolderid, `${file.imagefilename}.jpg`);
                    const thumbnailpath = path.join(SUPRADRIVE_PATH, 'userdata', username, 'images', file.imagefolderid.toString(), `${file.imagefilename}.thumb`);

                    let base64Thumbnail = "";
                    try {
                        if (fs.existsSync(thumbnailpath)) {
                            const imageBuffer = fs.readFileSync(thumbnailpath);
                            base64Thumbnail = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
                        }
                    } catch (error) {
                        console.error(`Error reading thumbnail: ${thumbnailpath}`, error);
                    }

                    return { ...file, base64Thumbnail };
                });

            } catch (e) {
                console.log(e);
            }

        }

        const res = [{ folders, files }];

        let SupraDrive = res.map((r: any) => {
            return <SupraDrive>r;
        })
        return SupraDrive;
    }


    public static async SupraDriveGetFile(userid: number, username: string, fileid: number): Promise<SupraDrive[]> {
        var fileContent = "";
        try {
            var [fileinfo] = await supradrive.query(`SELECT * FROM \`filesencrypted\` WHERE fileid=? AND userid=? AND wiped='0'`, [fileid, userid]);
        } catch (e) {
            console.log(e);
        }

        if (fileinfo.length > 0) {
            var currentfile = true;

            try {
                var [lastfile] = await supradrive.query(`SELECT fileid FROM \`filesencrypted\` WHERE fileidref = ? AND userid = ? AND wiped = '0' ORDER BY fileid DESC LIMIT 1`, [fileinfo[0].fileid, userid]);
                if (lastfile && lastfile.length > 0) {
                    if (lastfile[0]?.fileid !== fileinfo[0]?.fileid) {
                        currentfile = false;
                    }
                }
            } catch (e) {
                console.log(e);
            }
            try {
                var [lastfile] = await supradrive.query(`SELECT fileid FROM \`filesencrypted\` WHERE fileidref = ? AND userid = ? AND wiped = '0' ORDER BY fileid DESC LIMIT 1`, [fileinfo[0].fileidref, userid]);
                if (lastfile && lastfile.length > 0) {
                    if (lastfile[0]?.fileid !== fileinfo[0]?.fileid) {
                        currentfile = false;
                    }
                }
            } catch (e) {
                console.log(e);
            }

            if (currentfile) {
                fileinfo[0].currentfile = true;
                const folderDir = path.join(SUPRADRIVE_PATH, 'userdata', username, 'encrypted', 'text', `${fileinfo[0].folderid}`);
                const filePath = path.join(folderDir, `${fileinfo[0].filenamedisk}.txt`);
                fileContent = fs.readFileSync(filePath, 'utf8');
            }
            else {
                fileinfo[0].currentfile = false;
                const folderDir = path.join(SUPRADRIVE_PATH, 'userdata', username, 'encrypted', 'text', `${fileinfo[0].folderid}`);
                const folderOldDir = path.join(folderDir, '_old');
                const filePath = path.join(folderOldDir, `${fileinfo[0].filenamedisk}.txt`);
                fileContent = fs.readFileSync(filePath, 'utf8');
            }
        }

        var revisions = [];
        // get revisions of file
        if (fileinfo[0].fileidref) {
            try {
                [revisions] = await supradrive.query(`SELECT f.fileid,f.fileidref,f.filets FROM \`filesencrypted\` f WHERE ((fileidref=?) OR (fileid=?)) AND f.userid=? AND f.wiped='0' ORDER BY f.fileid DESC`, [fileinfo[0].fileidref, fileinfo[0].fileidref, userid]);
            } catch (e) {
                console.log(e);
            }
        }
        else {
            try {
                [revisions] = await supradrive.query(`SELECT f.fileid,f.fileidref,f.filets FROM \`filesencrypted\` f WHERE ((fileidref=?) OR (fileid=?)) AND f.userid=? AND f.wiped='0' ORDER BY f.fileid DESC`, [fileinfo[0].fileid, fileinfo[0].fileid, userid]);
            } catch (e) {
                console.log(e);
            }
        }

        const res = [{ fileinfo, fileContent, revisions }];

        let SupraDrive = res.map((r: any) => {
            return <SupraDrive>r;
        })
        return SupraDrive;
    }





    public static async SupraDriveGetImage(userid: number, username: string, fileid: number): Promise<SupraDrive[]> {
        var fileContent = "";
        try {
            var [fileinfo] = await supradrive.query(`SELECT * FROM \`filesimages\` WHERE imageid=? AND imageuserid=? AND imagewiped='0'`, [fileid, userid]);
        } catch (e) {
            console.log(e);
        }

        if (fileinfo.length > 0) {

            const imagepath = path.join(SUPRADRIVE_PATH, 'userdata', username, 'images', fileinfo[0].imagefolderid.toString(), `${fileinfo[0].imagefilename}.jpg`);

            let base64Image = "";
            try {
                if (fs.existsSync(imagepath)) {
                    const imageBuffer = fs.readFileSync(imagepath);
                    base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
                }
            } catch (error) {
                console.error(`Error reading image: ${imagepath}`, error);
            }

            return { ...fileinfo, base64Image };

        }

        const res = [{ fileinfo, fileContent }];

        let SupraDrive = res.map((r: any) => {
            return <SupraDrive>r;
        })
        return SupraDrive;
    }

}