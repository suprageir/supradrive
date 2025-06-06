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
const ffmpeg = require("fluent-ffmpeg");


import { promises as fileinfo } from 'fs';

import { rename } from 'fs/promises';
import { promisify } from 'util';

const copyFile = promisify(fs.copyFile);
const unlink = promisify(fs.unlink);

async function moveFile(tempPath: string, newPath: string) {
    try {
        await rename(tempPath, newPath);
    } catch (err) {
        console.error('Error moving file:', err);
    }
}

async function getFileSHA1(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha1');
        const stream = fs.createReadStream(filePath);

        stream.on('data', (chunk) => hash.update(chunk));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', (err) => reject(err));
    });
}

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

async function fnFilenameDisk(filename, sha) {
    // Replace specific characters
    let name = filename
        .replace(/ø/g, 'o')
        .replace(/Ø/g, 'O')
        .replace(/æ/g, 'ae')
        .replace(/Æ/g, 'Ae')
        .replace(/å/g, 'aa')
        .replace(/Å/g, 'Aa');

    // Remove illegal characters (except space), then replace spaces with underscores
    name = name.replace(/[^a-zA-Z0-9-_ .]/g, '').replace(/\s+/g, '_');

    // Extract name and extension
    let parts = name.split('.');
    let extension = parts.length > 1 ? parts.pop() : ''; // Get the extension if it exists
    let baseName = parts.join('.'); // Rejoin in case there were multiple dots

    // Append extra text
    let newFilename = `${baseName}_${sha}`;

    // Reattach extension if it exists
    if (extension) {
        newFilename += `.${extension}`;
    }

    return newFilename;
}

async function fnFolderNameDB(foldername) {
    // Replace specific characters
    let name = foldername
        .replace(/ø/g, 'o')
        .replace(/Ø/g, 'O')
        .replace(/æ/g, 'ae')
        .replace(/Æ/g, 'Ae')
        .replace(/å/g, 'aa')
        .replace(/Å/g, 'Aa');

    // Remove illegal characters (except space), then replace spaces with underscores
    name = name.replace(/[^a-zA-Z0-9-_ .]/g, '').replace(/\s+/g, '_');

    return name;
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

    public static async SupraDriveGetImageTags(userid: number, username: string): Promise<any> {
        try {
            const query = `SELECT * FROM codeimagehashtag WHERE uid = ?`;
            const values = [userid];
            const [result] = await supradrive.query(query, values);
            return result;
        } catch (e: any) {
            console.log(e);
            return [];
        }
    }

    public static async SupraDriveGetImageLocationTags(userid: number, username: string): Promise<any> {
        try {
            const query = `SELECT * FROM codeimagelocation WHERE uid = ?`;
            const values = [userid];
            const [result] = await supradrive.query(query, values);
            return result;
        } catch (e: any) {
            console.log(e);
            return [];
        }
    }


    public static async SupraDriveGetImageUserTags(userid: number, username: string): Promise<any> {
        try {
            const query = `SELECT * FROM codeimageuser WHERE uid = ?`;
            const values = [userid];
            const [result] = await supradrive.query(query, values);
            return result;
        } catch (e: any) {
            console.log(e);
            return [];
        }
    }

    public static async SupraDriveAddImageTag(userid: number, username: string, imageid: number, body: any): Promise<any> {
        var tiid = 0;
        try {
            const query = `SELECT id FROM codeimagehashtag WHERE hashtag = ? AND uid = ?`;
            const values = [body.hashtag.toLowerCase(), userid];
            var [result] = await supradrive.query(query, values);
            tiid = result?.[0]?.id || 0;
        } catch (e: any) {
            console.log(e);
            return [];
        }
        if (result.length === 0) {
            try {
                const query = `INSERT INTO codeimagehashtag (uid, hashtag) VALUES (?, ?)`;
                const values = [userid, body.hashtag.toLowerCase()];
                let [insertresult] = await supradrive.query(query, values);
                tiid = insertresult.insertId;
            } catch (e: any) {
                console.log(e);
                return [];
            }
        }
        if (tiid > 0) {
            try {
                const query = `SELECT id FROM imagehashtag WHERE uid = ? AND imageid = ? AND hashtagid = ?`;
                const values = [userid, imageid, tiid];
                var [result] = await supradrive.query(query, values);
                if (result.length === 0) {
                    try {
                        const query = `INSERT INTO imagehashtag (uid, imageid, hashtagid) VALUES (?, ?, ?)`;
                        const values = [userid, imageid, tiid];
                        await supradrive.query(query, values);
                    } catch (e: any) {
                        console.log(e);
                        return [];
                    }
                }
            } catch (e: any) {
                console.log(e);
                return [];
            }
        }
        try {
            const query = `SELECT * FROM codeimagehashtag WHERE uid = ?`;
            const values = [userid];
            const [result] = await supradrive.query(query, values);
            return result;
        } catch (e: any) {
            console.log(e);
            return [];
        }
    }

    public static async SupraDriveAddImageUserTag(userid: number, username: string, imageid: number, body: any): Promise<any> {
        var tuid = 0;
        try {
            const query = `SELECT id FROM codeimageuser WHERE user = ? AND uid = ?`;
            const values = [body.user.toLowerCase(), userid];
            var [result] = await supradrive.query(query, values);
            tuid = result?.[0]?.id || 0;
        } catch (e: any) {
            console.log(e);
            return [];
        }
        if (tuid === 0) {
            try {
                const query = `INSERT INTO codeimageuser (uid, user) VALUES (?, ?)`;
                const values = [userid, body.user.toLowerCase()];
                let [insertresult] = await supradrive.query(query, values);
                tuid = insertresult.insertId;
            } catch (e: any) {
                console.log(e);
                return [];
            }
        }
        if (tuid > 0) {
            try {
                const query = `SELECT userid FROM imageuser WHERE userid = ? AND imageid = ? AND id = ?`;
                const values = [userid, imageid, tuid];
                var [result] = await supradrive.query(query, values);
                if (result.length === 0) {
                    try {
                        const query = `INSERT INTO imageuser (uid, imageid, userid) VALUES (?, ?, ?)`;
                        const values = [userid, imageid, tuid];
                        await supradrive.query(query, values);
                    } catch (e: any) {
                        console.log(e);
                        return [];
                    }
                }
            } catch (e: any) {
                console.log(e);
                return [];
            }
        }
        try {
            const query = `SELECT * FROM codeimageuser WHERE uid = ?`;
            const values = [userid];
            const [result] = await supradrive.query(query, values);
            return result;
        } catch (e: any) {
            console.log(e);
            return [];
        }
    }


    public static async SupraDriveAddImageLocationTag(userid: number, username: string, imageid: number, body: any): Promise<any> {
        var tlid = 0;
        try {
            const query = `SELECT id FROM codeimagelocation WHERE location = ? AND uid = ?`;
            const values = [body.location.toLowerCase(), userid];
            var [result] = await supradrive.query(query, values);
            tlid = result?.[0]?.id || 0;
        } catch (e: any) {
            console.log(e);
            return [];
        }
        if (tlid === 0) {
            try {
                const query = `INSERT INTO codeimagelocation (uid, location) VALUES (?, ?)`;
                const values = [userid, body.location.toLowerCase()];
                let [insertresult] = await supradrive.query(query, values);
                tlid = insertresult.insertId;
            } catch (e: any) {
                console.log(e);
                return [];
            }
        }
        if (tlid > 0) {
            try {
                const query = `SELECT id FROM imagelocation WHERE uid = ? AND imageid = ? AND locationid = ?`;
                const values = [userid, imageid, tlid];
                var [result] = await supradrive.query(query, values);
                if (result.length === 0) {
                    try {
                        const query = `INSERT INTO imagelocation (uid, imageid, locationid) VALUES (?, ?, ?)`;
                        const values = [userid, imageid, tlid];
                        await supradrive.query(query, values);
                    } catch (e: any) {
                        console.log(e);
                        return [];
                    }
                }
            } catch (e: any) {
                console.log(e);
                return [];
            }
        }
        try {
            const query = `SELECT * FROM codeimagelocation WHERE uid = ?`;
            const values = [userid];
            const [result] = await supradrive.query(query, values);
            return result;
        } catch (e: any) {
            console.log(e);
            return [];
        }
    }


    public static async SupraDriveRemoveImageTag(userid: number, username: string, imageid: number, tagid: number): Promise<any> {
        try {
            const query = `DELETE FROM imagehashtag WHERE uid = ? AND imageid = ? AND hashtagid = ?`;
            const values = [userid, imageid, tagid];
            await supradrive.query(query, values);
        } catch (e: any) {
            console.log(e);
            return [];
        }

        try {
            const query = `SELECT COUNT(id) AS count FROM imagehashtag WHERE hashtagid = ?`;
            const values = [tagid];
            const [result] = await supradrive.query(query, values);
            if (result[0].count === 0) {
                const query = `DELETE FROM codeimagehashtag WHERE uid = ? AND id = ?`;
                const values = [userid, tagid];
                await supradrive.query(query, values);
            }
        } catch (e: any) {
            console.log(e);
            return [];
        }

        try {
            const query = `SELECT * FROM codeimagehashtag WHERE uid = ?`;
            const values = [userid];
            const [result] = await supradrive.query(query, values);
            return result;
        } catch (e: any) {
            console.log(e);
            return [];
        }
    }

    public static async SupraDriveRemoveImageUserTag(userid: number, username: string, imageid: number, tagid: number): Promise<any> {
        try {
            const query = `DELETE FROM imageuser WHERE uid = ? AND imageid = ? AND userid = ?`;
            const values = [userid, imageid, tagid];
            await supradrive.query(query, values);
        } catch (e: any) {
            console.log(e);
            return [];
        }

        try {
            const query = `SELECT COUNT(uid) AS count FROM imageuser WHERE userid = ?`;
            const values = [tagid];
            const [result] = await supradrive.query(query, values);
            if (result[0].count === 0) {
                const query = `DELETE FROM codeimageuser WHERE uid = ? AND id = ?`;
                const values = [userid, tagid];
                await supradrive.query(query, values);
            }
        } catch (e: any) {
            console.log(e);
            return [];
        }

        try {
            const query = `SELECT * FROM codeimageuser WHERE uid = ?`;
            const values = [userid];
            const [result] = await supradrive.query(query, values);
            return result;
        } catch (e: any) {
            console.log(e);
            return [];
        }
    }

    public static async SupraDriveRemoveImageLocationTag(userid: number, username: string, imageid: number, tagid: number): Promise<any> {
        try {
            const query = `DELETE FROM imagelocation WHERE uid = ? AND imageid = ? AND locationid = ?`;
            const values = [userid, imageid, tagid];
            await supradrive.query(query, values);
        } catch (e: any) {
            console.log(e);
            return [];
        }

        try {
            const query = `SELECT COUNT(id) AS count FROM imagelocation WHERE locationid = ?`;
            const values = [tagid];
            const [result] = await supradrive.query(query, values);
            if (result[0].count === 0) {
                const query = `DELETE FROM codeimagelocation WHERE uid = ? AND id = ?`;
                const values = [userid, tagid];
                await supradrive.query(query, values);
            }
        } catch (e: any) {
            console.log(e);
            return [];
        }

        try {
            const query = `SELECT * FROM codeimagelocation WHERE uid = ?`;
            const values = [userid];
            const [result] = await supradrive.query(query, values);
            return result;
        } catch (e: any) {
            console.log(e);
            return [];
        }
    }

    public static async SupraDriveNewImagesFolder(userid: number, username: string, body: any): Promise<any> {
        let foldersubid = body.foldersubid || null;
        let foldername = body.foldername;
        let foldernamedisk = await fnFolderNameDB(foldername);
        try {
            // Insert folder and get the new folderid
            const query = `INSERT INTO imagefolder (foldersubid, folderuserid, foldername, foldernamedisk) VALUES (?, ?, ?, ?)`;
            const values = [foldersubid, userid, foldername, foldernamedisk];
            const [result] = await supradrive.query(query, values);

            // Get the newly inserted folderid
            const folderid = result.insertId;

            // Create the new foldername with the folderid appended
            const updatedFolderName = `${foldernamedisk}_${folderid}`;

            // Update the foldername in the database
            const updateQuery = `UPDATE imagefolder SET foldernamedisk = ? WHERE folderid = ?`;
            await supradrive.query(updateQuery, [updatedFolderName, folderid]);

            return APIResponse("success", 200, `Folder ${foldername} created successfully`, "", folderid);
        } catch (e: any) {
            console.log(e);
            return APIResponse("error", 500, "Folder creation failed", e.message, null);
        }
    }

    public static async SupraDriveNewVideosFolder(userid: number, username: string, body: any): Promise<any> {
        let foldersubid = body.foldersubid || null;
        let foldername = body.foldername;
        let foldernamedisk = await fnFolderNameDB(foldername);
        try {
            // Insert folder and get the new folderid
            const query = `INSERT INTO videofolder (foldersubid, folderuserid, foldername, foldernamedisk) VALUES (?, ?, ?, ?)`;
            const values = [foldersubid, userid, foldername, foldernamedisk];
            const [result] = await supradrive.query(query, values);

            // Get the newly inserted folderid
            const folderid = result.insertId;

            // Create the new foldername with the folderid appended
            const updatedFolderName = `${foldernamedisk}_${folderid}`;

            // Update the foldername in the database
            const updateQuery = `UPDATE videofolder SET foldernamedisk = ? WHERE folderid = ?`;
            await supradrive.query(updateQuery, [updatedFolderName, folderid]);

            return APIResponse("success", 200, `Folder ${foldername} created successfully`, "", folderid);
        } catch (e: any) {
            console.log(e);
            return APIResponse("error", 500, "Folder creation failed", e.message, null);
        }
    }

    public static async SupraDriveNewMusicFolder(userid: number, username: string, body: any): Promise<any> {
        let foldersubid = body.foldersubid || null;
        let foldername = body.foldername;
        let foldernamedisk = await fnFolderNameDB(foldername);
        try {
            // Insert folder and get the new folderid
            const query = `INSERT INTO musicfolder (foldersubid, folderuserid, foldername, foldernamedisk) VALUES (?, ?, ?, ?)`;
            const values = [foldersubid, userid, foldername, foldernamedisk];
            const [result] = await supradrive.query(query, values);

            // Get the newly inserted folderid
            const folderid = result.insertId;

            // Create the new foldername with the folderid appended
            const updatedFolderName = `${foldernamedisk}_${folderid}`;

            // Update the foldername in the database
            const updateQuery = `UPDATE musicfolder SET foldernamedisk = ? WHERE folderid = ?`;
            await supradrive.query(updateQuery, [updatedFolderName, folderid]);

            return APIResponse("success", 200, `Folder ${foldername} created successfully`, "", folderid);
        } catch (e: any) {
            console.log(e);
            return APIResponse("error", 500, "Folder creation failed", e.message, null);
        }
    }

    public static async SupraDriveNewFilesFolder(userid: number, username: string, body: any): Promise<any> {
        let foldersubid = body.foldersubid || null;
        let foldername = body.foldername;
        let foldernamedisk = await fnFolderNameDB(foldername);
        try {
            // Insert folder and get the new folderid
            const query = `INSERT INTO filefolder (foldersubid, folderuserid, foldername, foldernamedisk) VALUES (?, ?, ?, ?)`;
            const values = [foldersubid, userid, foldername, foldernamedisk];
            const [result] = await supradrive.query(query, values);

            // Get the newly inserted folderid
            const folderid = result.insertId;

            // Create the new foldername with the folderid appended
            const updatedFolderName = `${foldernamedisk}_${folderid}`;

            // Update the foldername in the database
            const updateQuery = `UPDATE filefolder SET foldernamedisk = ? WHERE folderid = ?`;
            await supradrive.query(updateQuery, [updatedFolderName, folderid]);

            return APIResponse("success", 200, `Folder ${foldername} created successfully`, "", folderid);
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

    public static async SupraDriveNewImagesUpload(userid: number, username: string, body: any, file: any): Promise<any> {
        const timestamp = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
        const ts = Math.floor(Date.now() / 1000);
        const folderid = body.folderid;
        const filename = Buffer.from(file.originalname, 'latin1').toString('utf-8');
        let filecontent = file.buffer;
        let filesha1 = crypto.createHash('sha1').update(file.buffer).digest('hex');
        let created = body.created || null;
        let filesize = file.size || null;
        const filenamedisk = await fnFilenameDisk(filename, filesha1);

        try {
            const query = `SELECT imageid FROM imagefile WHERE imagesha1 = ?`;
            const values = [filesha1];
            const [sqlimageid] = await supradrive.query(query, values);

            // If the file already exists in the database, return immediately
            if (sqlimageid.length > 0) {
                return APIResponse("success", 200, `${filename} is duplicate in database (SHA1: ${filesha1}), not uploaded.`, "", sqlimageid[0].imageid);
            }
        } catch (e) {
            console.log("Database query error:", e);
            return APIResponse("error", 500, "Error checking for duplicate file", "", null);
        }

        let foldernamedisk = "";
        try {
            const foldername = `SELECT foldernamedisk FROM imagefolder WHERE folderid = ?`;
            const values = [folderid];
            const [result] = await supradrive.query(foldername, values);
            foldernamedisk = result[0]?.foldernamedisk || "";
        } catch (e) {
            console.log("Error fetching folder name:", e);
        }

        const userDir = path.join(SUPRADRIVE_PATH, 'userdata', username);
        if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });

        const imagesDir = path.join(userDir, 'images');
        if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

        const folderDir = path.join(imagesDir, foldernamedisk);
        if (!fs.existsSync(folderDir)) fs.mkdirSync(folderDir, { recursive: true });

        const filePath = path.join(folderDir, filenamedisk);
        const metaPath = path.join(folderDir, `${filenamedisk}.json`);

        if (fs.existsSync(filePath)) {
            return APIResponse("success", 200, `${filename} is duplicate on disk (${filePath}), NOT IN DATABASE, not uploaded.`, "", null);
        }

        // Save new file
        fs.writeFileSync(filePath, filecontent);

        // Extract metadata using Sharp
        let imageMetadata: any = {};
        try {
            imageMetadata = await sharp(filecontent).metadata();
            delete imageMetadata.icc;
            delete imageMetadata.exif;
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
            filename,
            timestamp,
            ts,
            width: imageMetadata.width,
            height: imageMetadata.height,
            format: imageMetadata.format,
            size: imageMetadata.size,
            imageMetadata,
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
        if (metacreatedate) {
            imagedatetime = moment.unix(parseInt(metacreatedate)).format("YYYY-MM-DD HH:mm:ss");
        }
        if (!imagedatetime && metadatetimeoriginal) {
            imagedatetime = moment.unix(parseInt(metadatetimeoriginal)).format("YYYY-MM-DD HH:mm:ss");
        }

        fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 4), 'utf8');

        try {
            const insertQuery = `
                INSERT INTO imagefile (
                    imagefolderid, imageuserid, imagesha1, imagefilename, imagefilenamedisk, 
                    imagefilesize, imageformat, imagedatetime, imagefiledatetime, imageheight, 
                    imagewidth, imagemetamake, imagemetamodel, imagemetasoftware, imagemetadatetime, 
                    imagemetafnumber, imagemetadatetimeoriginal, imagemetajson
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            const insertValues = [
                folderid, userid, filesha1, filename, filenamedisk, filesize,
                imageMetadata.format, imagedatetime, created, imageMetadata.height,
                imageMetadata.width, metamake, metamodel, imagemetasoftware, metacreatedate,
                metafnumber, metacreatedate, JSON.stringify(exifData, null, 4)
            ];

            await supradrive.query(insertQuery, insertValues);
        } catch (e) {
            console.log("Error inserting image data:", e);
        }

        const thumbnailBuffer = await createThumbnail(filecontent);
        const thumbnailPath = path.join(folderDir, `${filenamedisk}.thumb`);
        fs.writeFileSync(thumbnailPath, thumbnailBuffer);

        return APIResponse("success", 200, `Image ${filename} uploaded successfully`, "", null);
    }


    public static async SupraDriveNewVideosUpload(userid: number, username: string, body: any, file: any): Promise<any> {
        const folderid = body.folderid;
        const filename = file.originalname.toString("utf-8");
        let filesha1 = await getFileSHA1(file.path);
        let filesize = file.size || null;
        const filenamedisk = await fnFilenameDisk(filename, filesha1);

        try {
            const query = `SELECT videoid FROM videofile WHERE videosha1 = ?`;
            const values = [filesha1];
            var [sqlvideoid] = await supradrive.query(query, values);
            if (sqlvideoid.length > 0) {
                await unlink(file.path);
                return APIResponse("success", 200, filename + " already exists in database. File is not uploaded.", "", sqlvideoid[0].videoid);
            }
        } catch (e) {
            console.error("SQL Error:", e);
            return APIResponse("error", 500, "Database error", "", null);
        }

        let foldernamedisk = "";
        try {
            const foldername = `SELECT foldernamedisk FROM videofolder WHERE folderid = ?`;
            const values = [folderid];
            const [result] = await supradrive.query(foldername, values);
            foldernamedisk = result[0]?.foldernamedisk || "";
        } catch (e) {
            console.error("SQL Error:", e);
            return APIResponse("error", 500, "Database error", "", null);
        }

        const userDir = path.join(SUPRADRIVE_PATH, "userdata", username);
        const videosDir = path.join(userDir, "videos");
        const folderDir = path.join(videosDir, foldernamedisk);

        [userDir, videosDir, folderDir].forEach(dir => {
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        });

        const filePath = path.join(folderDir, filenamedisk);
        const metaPath = path.join(folderDir, `${filenamedisk}.json`);

        if (fs.existsSync(filePath)) {
            await unlink(file.path);
            return APIResponse("success", 200, filename + " already exists on disk but not in database. File is not uploaded.", "", null);
        }

        try {
            await moveFile(file.path, filePath);
        } catch (e) {
            console.error("File move error:", e);
            return APIResponse("error", 500, "File system error", "", null);
        }

        // ✅ Wrap ffmpeg processing in a Promise
        const videoMetadata: {
            format: string;
            duration: number;
            size: number | null;
            width?: number;
            height?: number;
            codec?: string;
            frame_rate?: string;
            recordingDate: string | null;
            recordingTime: string | null;
        } = await new Promise((resolve, reject) => {
            ffmpeg.ffprobe(filePath, (err, metadata) => {
                if (err) {
                    console.error("Error extracting metadata:", err);
                    return reject(err);
                }

                const duration = metadata?.format?.duration || 0;
                const formatTags = metadata?.format?.tags || {};
                const recordingDate = formatTags.creation_time ? moment(formatTags.creation_time).format("YYYY-MM-DD") : null;
                const recordingTime = formatTags.creation_time ? moment(formatTags.creation_time).format("HH:mm:ss") : null;

                ffmpeg(filePath)
                    .screenshots({
                        timestamps: [0.1],
                        filename: `${filenamedisk}.jpg`,
                        folder: folderDir,
                        size: "300x300",
                    })
                    .on("end", () => {
                        resolve({
                            format: metadata.format.format_name,
                            duration,
                            size: filesize,
                            width: metadata.streams[0]?.width,
                            height: metadata.streams[0]?.height,
                            codec: metadata.streams[0]?.codec_name,
                            frame_rate: metadata.streams[0]?.r_frame_rate,
                            recordingDate,
                            recordingTime,
                        });
                    })
                    .on("error", (thumbnailErr) => {
                        console.error("Error generating thumbnail", thumbnailErr);
                        resolve({
                            format: metadata.format.format_name,
                            duration,
                            size: filesize,
                            width: metadata.streams[0]?.width,
                            height: metadata.streams[0]?.height,
                            codec: metadata.streams[0]?.codec_name,
                            frame_rate: metadata.streams[0]?.r_frame_rate,
                            recordingDate,
                            recordingTime,
                        });
                    });
            });
        });


        // ✅ Write metadata to file
        fs.writeFileSync(metaPath, JSON.stringify(videoMetadata, null, 4), "utf8");

        // ✅ Insert video into database
        try {
            const query = `INSERT INTO videofile (videofolderid, videouserid, videosha1, videofilename, videofilenamedisk, videosize, videoformat, videoduration, videowidth, videoheight, videocodec, videodate, videotime, videometajson) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const values = [folderid, userid, filesha1, filename, filenamedisk, filesize, videoMetadata.format, videoMetadata.duration, videoMetadata.width, videoMetadata.height, videoMetadata.codec, videoMetadata.recordingDate, videoMetadata.recordingTime, JSON.stringify(videoMetadata)];
            const [result] = await supradrive.query(query, values);
            let insertId = result.insertId || null;
            return APIResponse("success", 200, "Video " + filename + " uploaded successfully", "", insertId);
        } catch (e) {
            console.error("Database insert error:", e);
            return APIResponse("error", 500, "Database error", "", null);
        }
    }



    public static async SupraDriveNewMusicUpload(userid: number, username: string, body: any, file: any): Promise<any> {
        const folderid = body.folderid;
        const filename = file.originalname.toString("utf-8");
        let filesha1 = await getFileSHA1(file.path);
        let filesize = file.size || null;
        const filenamedisk = await fnFilenameDisk(filename, filesha1);

        try {
            const query = `SELECT musicid FROM musicfile WHERE musicsha1 = ?`;
            const values = [filesha1];
            var [sqlmusicid] = await supradrive.query(query, values);
            if (sqlmusicid.length > 0) {
                await unlink(file.path);
                return APIResponse("success", 200, filename + " already exists in database. File is not uploaded.", "", sqlmusicid[0].musicid);
            }
        } catch (e) {
            console.error("SQL Error:", e);
            return APIResponse("error", 500, "Database error", "", null);
        }

        let foldernamedisk = "";
        try {
            const foldername = `SELECT foldernamedisk FROM musicfolder WHERE folderid = ?`;
            const values = [folderid];
            const [result] = await supradrive.query(foldername, values);
            foldernamedisk = result[0]?.foldernamedisk || "";
        } catch (e) {
            console.error("SQL Error:", e);
            return APIResponse("error", 500, "Database error", "", null);
        }

        const userDir = path.join(SUPRADRIVE_PATH, "userdata", username);
        const musicDir = path.join(userDir, "music");
        const folderDir = path.join(musicDir, foldernamedisk);

        [userDir, musicDir, folderDir].forEach(dir => {
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        });

        const filePath = path.join(folderDir, filenamedisk);
        const metaPath = path.join(folderDir, `${filenamedisk}.json`);

        if (fs.existsSync(filePath)) {
            await unlink(file.path);
            return APIResponse("success", 200, filename + " already exists on disk but not in database. File is not uploaded.", "", null);
        }

        try {
            await moveFile(file.path, filePath);
        } catch (e) {
            console.error("File move error:", e);
            return APIResponse("error", 500, "File system error", "", null);
        }


        const musicMetadata: {
            format: string;
            duration: number;
            size: number | null;
            width?: number;
            height?: number;
            codec?: string;
            frame_rate?: string;
            recordingDate: string | null;
            recordingTime: string | null;
        } = await new Promise((resolve, reject) => {
            ffmpeg.ffprobe(filePath, (err, metadata) => {
                if (err) {
                    console.error("Error extracting metadata:", err);
                    return reject(err);
                }

                const duration = metadata?.format?.duration || 0;
                const formatTags = metadata?.format?.tags || {};
                const recordingDate = formatTags.creation_time ? moment(formatTags.creation_time).format("YYYY-MM-DD") : null;
                const recordingTime = formatTags.creation_time ? moment(formatTags.creation_time).format("HH:mm:ss") : null;

                resolve({
                    format: metadata.format.format_name,
                    duration,
                    size: filesize,
                    width: metadata.streams[0]?.width,
                    height: metadata.streams[0]?.height,
                    codec: metadata.streams[0]?.codec_name,
                    frame_rate: metadata.streams[0]?.r_frame_rate,
                    recordingDate,
                    recordingTime,
                });
            });
        });


        fs.writeFileSync(metaPath, JSON.stringify(musicMetadata, null, 4), "utf8");

        try {
            const query = `INSERT INTO musicfile (musicfolderid, musicuserid, musicsha1, musictitle, musicfilename, musicfilenamedisk, musicsize, musicformat, musicduration, musiccodec, musicdate, musicmetajson) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const values = [folderid, userid, filesha1, filename, filename, filenamedisk, filesize, musicMetadata.format, musicMetadata.duration, musicMetadata.codec, musicMetadata.recordingDate, JSON.stringify(musicMetadata)];
            const [result] = await supradrive.query(query, values);
            let insertId = result.insertId || null;
            return APIResponse("success", 200, "Music " + filename + " uploaded successfully", "", insertId);
        } catch (e) {
            console.error("Database insert error:", e);
            return APIResponse("error", 500, "Database error", "", null);
        }
    }



    public static async SupraDriveNewFilesUpload(userid: number, username: string, body: any, file: any): Promise<any> {
        const folderid = body.folderid;
        const filename = Buffer.from(file.originalname, 'latin1').toString('utf8');
        // const filename = file.originalname.toString();
        let filesha1 = await getFileSHA1(file.path);
        let filesize = file.size || null;
        const filenamedisk = await fnFilenameDisk(filename, filesha1);
        const filecreated = body.created;
        const fileExt = path.extname(filename).toLowerCase().substring(1);

        try {
            const query = `SELECT fileid FROM file WHERE filesha1 = ?`;
            const values = [filesha1];
            var [sqlfileid] = await supradrive.query(query, values);
            if (sqlfileid.length > 0) {
                await unlink(file.path);
                return APIResponse("success", 200, filename + " already exists in database. File is not uploaded.", "", sqlfileid[0].fileid);
            }
        } catch (e) {
            console.error("SQL Error:", e);
            return APIResponse("error", 500, "Database error", "", null);
        }

        let foldernamedisk = "";
        try {
            const foldername = `SELECT foldernamedisk FROM filefolder WHERE folderid = ?`;
            const values = [folderid];
            const [result] = await supradrive.query(foldername, values);
            foldernamedisk = result[0]?.foldernamedisk || "";
        } catch (e) {
            console.error("SQL Error:", e);
            return APIResponse("error", 500, "Database error", "", null);
        }

        const userDir = path.join(SUPRADRIVE_PATH, "userdata", username);
        const fileDir = path.join(userDir, "file");
        const folderDir = path.join(fileDir, foldernamedisk);

        [userDir, fileDir, folderDir].forEach(dir => {
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        });

        const filePath = path.join(folderDir, filenamedisk);

        if (fs.existsSync(filePath)) {
            await unlink(file.path);
            return APIResponse("success", 200, filename + " already exists on disk but not in database. File is not uploaded.", "", null);
        }

        try {
            await moveFile(file.path, filePath);
        } catch (e) {
            console.error("File move error:", e);
            return APIResponse("error", 500, "File system error", "", null);
        }

        try {
            const query = `INSERT INTO file (filefolderid, fileuserid, filesha1, filecreated, filename, filenamedisk, filesize, fileext, fileformat) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const values = [folderid, userid, filesha1, filecreated, filename, filenamedisk, filesize, fileExt, file.mimetype];
            const [result] = await supradrive.query(query, values);
            let insertId = result.insertId || null;
            return APIResponse("success", 200, "File " + filename + " uploaded successfully", "", insertId);
        } catch (e) {
            console.error("Database insert error:", e);
            return APIResponse("error", 500, "Database error", "", null);
        }
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
                var [folders] = await supradrive.query(`SELECT folderid,foldersubid,folderuserid,foldername,foldernamedisk FROM \`imagefolder\` WHERE foldersubid IS NULL AND folderuserid=? AND folderwiped='0' ORDER BY foldername ASC`, [userid]);
            } catch (e) {
                console.log(e);
            }
        }
        else {
            try {
                var [folders] = await supradrive.query(`SELECT folderid,foldersubid,folderuserid,foldername,foldernamedisk FROM \`imagefolder\` WHERE foldersubid=? AND folderuserid=? AND folderwiped='0' ORDER BY foldername ASC`, [foldersubid, userid]);
            } catch (e) {
                console.log(e);
            }

            try {
                var [files] = await supradrive.query(`SELECT i.*, f.foldernamedisk FROM imagefile i LEFT JOIN imagefolder f ON i.imagefolderid = f.folderid WHERE i.imagefolderid = ? AND i.imageuserid = ? AND i.imagewiped = '0'`, [foldersubid, userid]);

                files = await Promise.all(files.map(async file => {

                    const thumbnailpath = path.join(SUPRADRIVE_PATH, 'userdata', username, 'images', file.foldernamedisk, `${file.imagefilenamedisk}.thumb`);

                    let base64Thumbnail = "";
                    try {
                        if (fs.existsSync(thumbnailpath)) {
                            const imageBuffer = fs.readFileSync(thumbnailpath);
                            base64Thumbnail = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
                        }
                    } catch (error) {
                        console.error(`Error reading thumbnail: ${thumbnailpath}`, error);
                    }

                    let imagehashtags = [];
                    try {
                        const [imagetags] = await supradrive.query(`SELECT t.id,t.hashtagid,h.hashtag FROM imagehashtag t LEFT OUTER JOIN codeimagehashtag h ON t.hashtagid = h.id WHERE imageid = ?`, [file.imageid]);
                        imagehashtags = imagetags;
                    } catch (e) {
                        console.log(e);
                    }

                    let imageusertags = [];
                    try {
                        const [utags] = await supradrive.query(`SELECT u.id,u.imageid,u.userid,n.user FROM imageuser u LEFT OUTER JOIN codeimageuser n ON n.id = u.userid WHERE u.imageid = ?`, [file.imageid]);
                        imageusertags = utags;
                    } catch (e) {
                        console.log(e);
                    }

                    let imagelocationtags = [];
                    try {
                        const [ltags] = await supradrive.query(`SELECT l.id,l.imageid,l.locationid,n.location FROM imagelocation l LEFT OUTER JOIN codeimagelocation n ON n.id = l.locationid WHERE l.imageid = ?`, [file.imageid]);
                        imagelocationtags = ltags;
                    } catch (e) {
                        console.log(e);
                    }

                    return { ...file, base64Thumbnail, imagehashtags, imageusertags, imagelocationtags };
                }));

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


    public static async SupraDriveGetVideosFolder(userid: number, username: string, foldersubid: number): Promise<SupraDrive[]> {
        if (foldersubid === 0) {
            try {
                var [folders] = await supradrive.query(`SELECT folderid,foldersubid,folderuserid,foldername,foldernamedisk FROM \`videofolder\` WHERE foldersubid IS NULL AND folderuserid=? AND folderwiped='0' ORDER BY foldername ASC`, [userid]);
            } catch (e) {
                console.log(e);
            }
        }
        else {
            try {
                var [folders] = await supradrive.query(`SELECT folderid,foldersubid,folderuserid,foldername,foldernamedisk FROM \`videofolder\` WHERE foldersubid=? AND folderuserid=? AND folderwiped='0' ORDER BY foldername ASC`, [foldersubid, userid]);
            } catch (e) {
                console.log(e);
            }

            try {
                var [files] = await supradrive.query(`SELECT v.*, f.foldernamedisk FROM videofile v LEFT JOIN videofolder f ON v.videofolderid = f.folderid WHERE v.videofolderid = ? AND v.videouserid = ? AND v.videowiped = '0'`, [foldersubid, userid]);

                files = await Promise.all(files.map(async file => {

                    const thumbnailpath = path.join(SUPRADRIVE_PATH, 'userdata', username, 'videos', file.foldernamedisk, `${file.videofilenamedisk}.jpg`);

                    let base64Thumbnail = "";
                    try {
                        if (fs.existsSync(thumbnailpath)) {
                            const imageBuffer = fs.readFileSync(thumbnailpath);
                            base64Thumbnail = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
                        }
                    } catch (error) {
                        console.error(`Error reading thumbnail: ${thumbnailpath}`, error);
                    }

                    let videohashtags = [];
                    try {
                        const [videotags] = await supradrive.query(`SELECT t.id,t.hashtagid,h.hashtag FROM videohashtag t LEFT OUTER JOIN codevideohashtag h ON t.hashtagid = h.id WHERE videoid = ?`, [file.videoid]);
                        videohashtags = videotags;
                    } catch (e) {
                        console.log(e);
                    }

                    let videousertags = [];
                    try {
                        const [utags] = await supradrive.query(`SELECT u.id,u.videoid,u.userid,n.user FROM videouser u LEFT OUTER JOIN codevideouser n ON n.id = u.userid WHERE u.videoid = ?`, [file.videoid]);
                        videousertags = utags;
                    } catch (e) {
                        console.log(e);
                    }

                    let videolocationtags = [];
                    try {
                        const [ltags] = await supradrive.query(`SELECT l.id,l.videoid,l.locationid,n.location FROM videolocation l LEFT OUTER JOIN codevideolocation n ON n.id = l.locationid WHERE l.videoid = ?`, [file.videoid]);
                        videolocationtags = ltags;
                    } catch (e) {
                        console.log(e);
                    }

                    return { ...file, base64Thumbnail, videohashtags, videousertags, videolocationtags };
                }));

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

    public static async SupraDriveGetMusicFolder(userid: number, username: string, foldersubid: number): Promise<SupraDrive[]> {
        if (foldersubid === 0) {
            try {
                var [folders] = await supradrive.query(`SELECT folderid,foldersubid,folderuserid,foldername,foldernamedisk FROM \`musicfolder\` WHERE foldersubid IS NULL AND folderuserid=? AND folderwiped='0' ORDER BY foldername ASC`, [userid]);
            } catch (e) {
                console.log(e);
            }
        }
        else {
            try {
                var [folders] = await supradrive.query(`SELECT folderid,foldersubid,folderuserid,foldername,foldernamedisk FROM \`musicfolder\` WHERE foldersubid=? AND folderuserid=? AND folderwiped='0' ORDER BY foldername ASC`, [foldersubid, userid]);
            } catch (e) {
                console.log(e);
            }

            try {
                var [files] = await supradrive.query(`SELECT m.*, f.foldernamedisk FROM musicfile m LEFT JOIN musicfolder f ON m.musicfolderid = f.folderid WHERE m.musicfolderid = ? AND m.musicuserid = ? AND m.musicwiped = '0'`, [foldersubid, userid]);

                files = await Promise.all(files.map(async file => {
                    return { ...file };
                }));

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

    public static async SupraDriveGetFilesFolder(userid: number, username: string, foldersubid: number): Promise<SupraDrive[]> {
        if (foldersubid === 0) {
            try {
                var [folders] = await supradrive.query(`SELECT folderid,foldersubid,folderuserid,foldername,foldernamedisk FROM \`filefolder\` WHERE foldersubid IS NULL AND folderuserid=? AND folderwiped='0' ORDER BY foldername ASC`, [userid]);
            } catch (e) {
                console.log(e);
            }
        }
        else {
            try {
                var [folders] = await supradrive.query(`SELECT folderid,foldersubid,folderuserid,foldername,foldernamedisk FROM \`filefolder\` WHERE foldersubid=? AND folderuserid=? AND folderwiped='0' ORDER BY foldername ASC`, [foldersubid, userid]);
            } catch (e) {
                console.log(e);
            }

            try {
                var [files] = await supradrive.query(`SELECT f.*, fo.foldernamedisk FROM file f LEFT JOIN filefolder fo ON fo.folderid = f.filefolderid WHERE f.filefolderid = ? AND f.fileuserid = ? AND f.filewiped = '0'`, [foldersubid, userid]);

                files = await Promise.all(files.map(async file => {
                    return { ...file };
                }));

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
            var [fileinfo] = await supradrive.query(`SELECT i.*, f.foldernamedisk FROM \`imagefile\` i LEFT JOIN \`imagefolder\` f ON i.imagefolderid = f.folderid WHERE i.imageid=? AND i.imageuserid=? AND i.imagewiped='0'`, [fileid, userid]);
        } catch (e) {
            console.log(e);
        }

        if (fileinfo.length > 0) {

            const imagepath = path.join(SUPRADRIVE_PATH, 'userdata', username, 'images', fileinfo[0].foldernamedisk, `${fileinfo[0].imagefilenamedisk}`);

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

    public static async SupraDriveGetVideo(userid: number, username: string, fileid: number, req: any, res: any): Promise<any> {
        try {
            var [fileinfo] = await supradrive.query(
                `SELECT v.*, f.foldernamedisk FROM \`videofile\` v 
                 LEFT JOIN \`videofolder\` f ON v.videofolderid = f.folderid 
                 WHERE v.videoid=? AND v.videouserid=? AND v.videowiped='0'`,
                [fileid, userid]
            );
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: "Database query error" });
            return false;
        }

        if (!fileinfo || fileinfo.length === 0) {
            return false; // Return false to indicate no video found
        }

        const videopath = path.join(SUPRADRIVE_PATH, 'userdata', username, 'videos', fileinfo[0].foldernamedisk, fileinfo[0].videofilenamedisk);

        if (!fs.existsSync(videopath)) {
            return res.status(404).json({ error: "File not found" });
        }

        const stat = fs.statSync(videopath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunkSize = end - start + 1;

            const file = fs.createReadStream(videopath, { start, end });
            const head = {
                "Content-Range": `bytes ${start}-${end}/${fileSize}`,
                "Accept-Ranges": "bytes",
                "Content-Length": chunkSize,
                "Content-Type": "video/mp4",
            };

            res.writeHead(206, head);
            file.pipe(res);
        } else {
            const head = {
                "Content-Length": fileSize,
                "Content-Type": "video/mp4",
            };

            res.writeHead(200, head);
            fs.createReadStream(videopath).pipe(res);
        }
    }
}