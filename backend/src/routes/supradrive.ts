require('dotenv').config();
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { sqlSupraDrive } from 'src/services/supradrive';
import { SupraDrive } from 'src/models/supradrive.model';
const supradrive = require('../shared/supradrive');
const { BAD_REQUEST, OK } = StatusCodes;
const moment = require('moment');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
import * as fs from 'fs';
import * as path from 'path';
const SUPRADRIVE_PATH = process.env.SUPRADRIVE_PATH || '';

interface MulterRequest extends Request {
    file?: any;
}

export async function SupraDriveAuthToken(req: Request, res: Response) {
    const ts = moment(new Date()).format("DD.MM.YYYY HH:mm:ss");
    console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[32mOK\x1b[30m] [\x1b[35m(auth)\x1b[30m] => \x1b[32mGET\x1b[30m => \x1b[36m" + req.originalUrl);
    return res.status(OK).json({ message: 'Token is valid' });
}

export async function SupraDriveNewFolder(req: Request, res: Response) {
    const ts = moment(new Date()).format("DD.MM.YYYY HH:mm:ss");
    const supradriveuser = (req as any).user;
    const userid = supradriveuser.userid;
    const username = supradriveuser.username;
    if (req.body) {
        console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[32mOK\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mPOST\x1b[30m => \x1b[36m" + req.originalUrl);
        let posts: SupraDrive[] = await sqlSupraDrive.SupraDriveFolderNew(userid, username, req.body);
        return res.status(OK).json(posts);
    }
    else {
        console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[31mERROR\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mGET\x1b[30m => \x1b[36m" + req.originalUrl);
        return res.status(BAD_REQUEST);
    }
}

export async function SupraDriveNewImagesFolder(req: Request, res: Response) {
    const ts = moment(new Date()).format("DD.MM.YYYY HH:mm:ss");
    const supradriveuser = (req as any).user;
    const userid = supradriveuser.userid;
    const username = supradriveuser.username;
    if (req.body) {
        console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[32mOK\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mPOST\x1b[30m => \x1b[36m" + req.originalUrl);
        let posts: SupraDrive[] = await sqlSupraDrive.SupraDriveNewImagesFolder(userid, username, req.body);
        return res.status(OK).json(posts);
    }
    else {
        console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[31mERROR\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mGET\x1b[30m => \x1b[36m" + req.originalUrl);
        return res.status(BAD_REQUEST);
    }
}

export async function SupraDriveNewVideosFolder(req: Request, res: Response) {
    const ts = moment(new Date()).format("DD.MM.YYYY HH:mm:ss");
    const supradriveuser = (req as any).user;
    const userid = supradriveuser.userid;
    const username = supradriveuser.username;
    if (req.body) {
        console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[32mOK\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mPOST\x1b[30m => \x1b[36m" + req.originalUrl);
        let posts: SupraDrive[] = await sqlSupraDrive.SupraDriveNewVideosFolder(userid, username, req.body);
        return res.status(OK).json(posts);
    }
    else {
        console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[31mERROR\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mGET\x1b[30m => \x1b[36m" + req.originalUrl);
        return res.status(BAD_REQUEST);
    }
}

export async function SupraDriveNewMusicFolder(req: Request, res: Response) {
    const ts = moment(new Date()).format("DD.MM.YYYY HH:mm:ss");
    const supradriveuser = (req as any).user;
    const userid = supradriveuser.userid;
    const username = supradriveuser.username;
    if (req.body) {
        console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[32mOK\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mPOST\x1b[30m => \x1b[36m" + req.originalUrl);
        let posts: SupraDrive[] = await sqlSupraDrive.SupraDriveNewMusicFolder(userid, username, req.body);
        return res.status(OK).json(posts);
    }
    else {
        console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[31mERROR\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mGET\x1b[30m => \x1b[36m" + req.originalUrl);
        return res.status(BAD_REQUEST);
    }
}

export async function SupraDriveNewFilesFolder(req: Request, res: Response) {
    const ts = moment(new Date()).format("DD.MM.YYYY HH:mm:ss");
    const supradriveuser = (req as any).user;
    const userid = supradriveuser.userid;
    const username = supradriveuser.username;
    if (req.body) {
        console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[32mOK\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mPOST\x1b[30m => \x1b[36m" + req.originalUrl);
        let posts: SupraDrive[] = await sqlSupraDrive.SupraDriveNewFilesFolder(userid, username, req.body);
        return res.status(OK).json(posts);
    }
    else {
        console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[31mERROR\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mGET\x1b[30m => \x1b[36m" + req.originalUrl);
        return res.status(BAD_REQUEST);
    }
}



export async function SupraDriveEncryptedTextSave(req: Request, res: Response) {
    const ts = moment(new Date()).format("DD.MM.YYYY HH:mm:ss");
    const ip = req.headers['x-forwarded-for']
        ? (Array.isArray(req.headers['x-forwarded-for']) ? req.headers['x-forwarded-for'][0] : req.headers['x-forwarded-for'].split(',')[0])
        : req.socket.remoteAddress;
    const clientIp = ip ? ip.trim() : null;

    const supradriveuser = (req as any).user;
    const userid = supradriveuser.userid;
    const username = supradriveuser.username;
    if (req.body) {
        console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[32mOK\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mPOST\x1b[30m => \x1b[36m" + req.originalUrl + " \x1b[30m(" + ip + ")\x1b[0m");
        let posts: SupraDrive[] = await sqlSupraDrive.SupraDriveEncryptedTextSave(userid, username, req.body);
        return res.status(OK).json(posts);
    }
    else {
        console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[31mERROR\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mGET\x1b[30m => \x1b[36m" + req.originalUrl + " \x1b[30m(" + ip + ")\x1b[0m");
        return res.status(BAD_REQUEST);
    }
}

export async function SupraDriveEncryptedTextUpload(req: MulterRequest, res: Response) {
    const ts = moment(new Date()).format("DD.MM.YYYY HH:mm:ss");
    const supradriveuser = (req as any).user;
    const userid = supradriveuser.userid;
    const username = supradriveuser.username;
    if (req.body) {
        console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[32mOK\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mPOST\x1b[30m => \x1b[36m" + req.originalUrl);
        let posts: SupraDrive[] = await sqlSupraDrive.SupraDriveEncryptedTextUpload(userid, username, req.body, req.file);
        return res.status(OK).json(posts);
    }
    else {
        console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[31mERROR\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mGET\x1b[30m => \x1b[36m" + req.originalUrl);
        return res.status(BAD_REQUEST);
    }
}

export async function SupraDriveNewImagesUpload(req: MulterRequest, res: Response) {
    const ts = moment(new Date()).format("DD.MM.YYYY HH:mm:ss");
    const supradriveuser = (req as any).user;
    const userid = supradriveuser.userid;
    const username = supradriveuser.username;
    if (req.body) {
        console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[32mOK\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mPOST\x1b[30m => \x1b[36m" + req.originalUrl);
        let posts: any = await sqlSupraDrive.SupraDriveNewImagesUpload(userid, username, req.body, req.file);
        let json = JSON.parse(posts);
        if (json.status === "success") {
            return res.status(OK).json(posts);
        }
        else {
            return res.status(BAD_REQUEST).json(posts);
        }
    }
    else {
        console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[31mERROR\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mGET\x1b[30m => \x1b[36m" + req.originalUrl);
        return res.status(BAD_REQUEST);
    }
}

export async function SupraDriveNewVideosUpload(req: MulterRequest, res: Response) {
    const ts = moment(new Date()).format("DD.MM.YYYY HH:mm:ss");
    const supradriveuser = (req as any).user;
    const userid = supradriveuser.userid;
    const username = supradriveuser.username;
    console.log("upload video req from userid: " + userid + " and username: " + username);
    if (req.body) {
        console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[32mOK\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mPOST\x1b[30m => \x1b[36m" + req.originalUrl);
        let posts: any = await sqlSupraDrive.SupraDriveNewVideosUpload(userid, username, req.body, req.file);
        let json = JSON.parse(posts);
        if (json.status === "success") {
            return res.status(OK).json(posts);
        }
        else {
            console.log("error");
            return res.status(BAD_REQUEST).json(posts);
        }
    }
    else {
        console.log("else");
        console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[31mERROR\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mGET\x1b[30m => \x1b[36m" + req.originalUrl);
        return res.status(BAD_REQUEST);
    }
}

export async function SupraDriveNewMusicUpload(req: MulterRequest, res: Response) {
    const ts = moment(new Date()).format("DD.MM.YYYY HH:mm:ss");
    const supradriveuser = (req as any).user;
    const userid = supradriveuser.userid;
    const username = supradriveuser.username;
    console.log("upload video req from userid: " + userid + " and username: " + username);
    if (req.body) {
        console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[32mOK\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mPOST\x1b[30m => \x1b[36m" + req.originalUrl);
        let posts: any = await sqlSupraDrive.SupraDriveNewMusicUpload(userid, username, req.body, req.file);
        let json = JSON.parse(posts);
        if (json.status === "success") {
            return res.status(OK).json(posts);
        }
        else {
            console.log("error");
            return res.status(BAD_REQUEST).json(posts);
        }
    }
    else {
        console.log("else");
        console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[31mERROR\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mGET\x1b[30m => \x1b[36m" + req.originalUrl);
        return res.status(BAD_REQUEST);
    }
}

export async function SupraDriveNewFilesUpload(req: MulterRequest, res: Response) {
    const ts = moment(new Date()).format("DD.MM.YYYY HH:mm:ss");
    const supradriveuser = (req as any).user;
    const userid = supradriveuser.userid;
    const username = supradriveuser.username;
    console.log("upload video req from userid: " + userid + " and username: " + username);
    console.log(req.body);
    console.log(req.file);
    if (req.body) {
        console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[32mOK\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mPOST\x1b[30m => \x1b[36m" + req.originalUrl);
        let posts: any = await sqlSupraDrive.SupraDriveNewFilesUpload(userid, username, req.body, req.file);
        let json = JSON.parse(posts);
        if (json.status === "success") {
            return res.status(OK).json(posts);
        }
        else {
            console.log("error");
            return res.status(BAD_REQUEST).json(posts);
        }
    }
    else {
        console.log("else");
        console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[31mERROR\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mGET\x1b[30m => \x1b[36m" + req.originalUrl);
        return res.status(BAD_REQUEST);
    }
}



export async function SupraDriveGetFolders(req: Request, res: Response) {
    const ts = moment(new Date()).format("DD.MM.YYYY HH:mm:ss");
    const ip = req.headers['x-forwarded-for']
        ? (Array.isArray(req.headers['x-forwarded-for']) ? req.headers['x-forwarded-for'][0] : req.headers['x-forwarded-for'].split(',')[0])
        : req.socket.remoteAddress;
    const clientIp = ip ? ip.trim() : null;
    const supradriveuser = (req as any).user;
    const userid = supradriveuser.userid;
    const username = supradriveuser.username;

    if (req.params.foldersysid) {
        console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[32mOK\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mPOST\x1b[30m => \x1b[36m" + req.originalUrl + " \x1b[30m(" + ip + ")\x1b[0m");
        let posts: SupraDrive[] = await sqlSupraDrive.getFolders(userid, username, parseInt(req.params.foldersysid));
        return res.status(OK).json(posts);
    }
    else {
        console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[31mERROR\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mGET\x1b[30m => \x1b[36m" + req.originalUrl + " \x1b[30m(" + ip + ")\x1b[0m");
        return res.status(BAD_REQUEST);
    }
}

export async function SupraDriveGetVideosFolder(req: Request, res: Response) {
    const ts = moment(new Date()).format("DD.MM.YYYY HH:mm:ss");
    const supradriveuser = (req as any).user;
    const userid = supradriveuser.userid;
    const username = supradriveuser.username;

    if (req.params.foldersubid) {
        console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[32mOK\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mPOST\x1b[30m => \x1b[36m" + req.originalUrl);
        let posts: SupraDrive[] = await sqlSupraDrive.SupraDriveGetVideosFolder(userid, username, parseInt(req.params.foldersubid));
        return res.status(OK).json(posts);
    }
    else {
        console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[31mERROR\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mGET\x1b[30m => \x1b[36m" + req.originalUrl);
        return res.status(BAD_REQUEST);
    }
}

export async function SupraDriveGetMusicFolder(req: Request, res: Response) {
    const ts = moment(new Date()).format("DD.MM.YYYY HH:mm:ss");
    const supradriveuser = (req as any).user;
    const userid = supradriveuser.userid;
    const username = supradriveuser.username;

    if (req.params.foldersubid) {
        console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[32mOK\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mPOST\x1b[30m => \x1b[36m" + req.originalUrl);
        let posts: SupraDrive[] = await sqlSupraDrive.SupraDriveGetMusicFolder(userid, username, parseInt(req.params.foldersubid));
        return res.status(OK).json(posts);
    }
    else {
        console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[31mERROR\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mGET\x1b[30m => \x1b[36m" + req.originalUrl);
        return res.status(BAD_REQUEST);
    }
}

export async function SupraDriveGetFilesFolder(req: Request, res: Response) {
    const ts = moment(new Date()).format("DD.MM.YYYY HH:mm:ss");
    const supradriveuser = (req as any).user;
    const userid = supradriveuser.userid;
    const username = supradriveuser.username;

    if (req.params.foldersubid) {
        console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[32mOK\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mPOST\x1b[30m => \x1b[36m" + req.originalUrl);
        let posts: SupraDrive[] = await sqlSupraDrive.SupraDriveGetFilesFolder(userid, username, parseInt(req.params.foldersubid));
        return res.status(OK).json(posts);
    }
    else {
        console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[31mERROR\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mGET\x1b[30m => \x1b[36m" + req.originalUrl);
        return res.status(BAD_REQUEST);
    }
}

export async function SupraDriveGetImagesFolder(req: Request, res: Response) {
    const ts = moment(new Date()).format("DD.MM.YYYY HH:mm:ss");
    const supradriveuser = (req as any).user;
    const userid = supradriveuser.userid;
    const username = supradriveuser.username;

    if (req.params.foldersubid) {
        console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[32mOK\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mPOST\x1b[30m => \x1b[36m" + req.originalUrl);
        let posts: SupraDrive[] = await sqlSupraDrive.SupraDriveGetImagesFolder(userid, username, parseInt(req.params.foldersubid));
        return res.status(OK).json(posts);
    }
    else {
        console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[31mERROR\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mGET\x1b[30m => \x1b[36m" + req.originalUrl);
        return res.status(BAD_REQUEST);
    }
}

export async function SupraDriveGetFile(req: Request, res: Response) {
    const ts = moment(new Date()).format("DD.MM.YYYY HH:mm:ss");
    const ip = req.headers['x-forwarded-for']
        ? (Array.isArray(req.headers['x-forwarded-for']) ? req.headers['x-forwarded-for'][0] : req.headers['x-forwarded-for'].split(',')[0])
        : req.socket.remoteAddress;
    const clientIp = ip ? ip.trim() : null;
    const supradriveuser = (req as any).user;
    const userid = supradriveuser.userid;
    const username = supradriveuser.username;

    if (req.params.fileid) {
        console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[32mOK\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mPOST\x1b[30m => \x1b[36m" + req.originalUrl + " \x1b[30m(" + ip + ")\x1b[0m");
        let posts: SupraDrive[] = await sqlSupraDrive.SupraDriveGetFile(userid, username, parseInt(req.params.fileid));
        return res.status(OK).json(posts);
    }
    else {
        console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[31mERROR\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mGET\x1b[30m => \x1b[36m" + req.originalUrl + " \x1b[30m(" + ip + ")\x1b[0m");
        return res.status(BAD_REQUEST);
    }
}


export async function SupraDriveGetImage(req: Request, res: Response) {
    const ts = moment(new Date()).format("DD.MM.YYYY HH:mm:ss");
    const supradriveuser = (req as any).user;
    const userid = supradriveuser.userid;
    const username = supradriveuser.username;

    if (req.params.fileid) {
        console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[32mOK\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mPOST\x1b[30m => \x1b[36m" + req.originalUrl);
        let posts: SupraDrive[] = await sqlSupraDrive.SupraDriveGetImage(userid, username, parseInt(req.params.fileid));
        return res.status(OK).json(posts);
    }
    else {
        console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[31mERROR\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mGET\x1b[30m => \x1b[36m" + req.originalUrl);
        return res.status(BAD_REQUEST);
    }
}


export async function SupraDriveGetVideo(req: Request, res: Response) {
    const ts = moment(new Date()).format("DD.MM.YYYY HH:mm:ss");
    const supradriveuser = (req as any).user;
    const userid = supradriveuser.userid;
    const username = supradriveuser.username;

    try {
        var [fileinfo] = await supradrive.query(
            `SELECT v.*, f.foldernamedisk FROM \`videofile\` v 
             LEFT JOIN \`videofolder\` f ON v.videofolderid = f.folderid 
             WHERE v.videoid=? AND v.videouserid=? AND v.videowiped='0'`,
            [req.params.fileid, userid]
        );
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Database query error" });
        return false;
    }

    if (!fileinfo || fileinfo.length === 0) {
        return false;
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

export async function SupraDriveGetMusic(req: Request, res: Response) {
    const ts = moment(new Date()).format("DD.MM.YYYY HH:mm:ss");
    const supradriveuser = (req as any).user;
    const userid = supradriveuser.userid;
    const username = supradriveuser.username;
    try {
        var [fileinfo] = await supradrive.query(
            `SELECT m.*, f.foldernamedisk FROM \`musicfile\` m 
             LEFT JOIN \`musicfolder\` f ON m.musicfolderid = f.folderid 
             WHERE m.musicid=? AND m.musicuserid=? AND m.musicwiped='0'`,
            [req.params.fileid, userid]
        );
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Database query error" });
        return false;
    }

    if (!fileinfo || fileinfo.length === 0) {
        return false;
    }

    const musicpath = path.join(SUPRADRIVE_PATH, 'userdata', username, 'music', fileinfo[0].foldernamedisk, fileinfo[0].musicfilenamedisk);

    if (!fs.existsSync(musicpath)) {
        return res.status(404).json({ error: "File not found" });
    }

    const stat = fs.statSync(musicpath);
    const fileSize = stat.size;
    const range = req.headers.range;


    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = end - start + 1;

        const file = fs.createReadStream(musicpath, { start, end });
        const head = {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunkSize,
            "Content-Type": "audio/mpeg",
        };

        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            "Content-Length": fileSize,
            "Content-Type": "audio/mpeg",
        };

        res.writeHead(200, head);
        fs.createReadStream(musicpath).pipe(res);
    }


}

export async function SupraDriveGetFileDetails(req: Request, res: Response) {
    const ts = moment(new Date()).format("DD.MM.YYYY HH:mm:ss");
    const supradriveuser = (req as any).user;
    const userid = supradriveuser.userid;
    const username = supradriveuser.username;
    try {
        var [fileinfo] = await supradrive.query(
            `SELECT m.*, f.foldernamedisk FROM \`file\` m 
             LEFT JOIN \`filefolder\` f ON m.filefolderid = f.folderid 
             WHERE m.fileid=? AND m.fileuserid=? AND m.filewiped='0'`,
            [req.params.fileid, userid]
        );
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Database query error" });
        return false;
    }

    if (!fileinfo || fileinfo.length === 0) {
        return false;
    }

    const filepath = path.join(SUPRADRIVE_PATH, 'userdata', username, 'file', fileinfo[0].foldernamedisk, fileinfo[0].filefilenamedisk);

    if (!fs.existsSync(filepath)) {
        return res.status(404).json({ error: "File not found" });
    }

    const stat = fs.statSync(filepath);
    const fileSize = stat.size;
    const range = req.headers.range;


    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = end - start + 1;

        const file = fs.createReadStream(filepath, { start, end });
        const head = {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunkSize,
            "Content-Type": "audio/mpeg",
        };

        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            "Content-Length": fileSize,
            "Content-Type": "audio/mpeg",
        };

        res.writeHead(200, head);
        fs.createReadStream(filepath).pipe(res);
    }
}



export async function SupraDriveGetImageTags(req: Request, res: Response) {
    const ts = moment(new Date()).format("DD.MM.YYYY HH:mm:ss");
    const supradriveuser = (req as any).user;
    const userid = supradriveuser.userid;
    const username = supradriveuser.username;
    console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[32mOK\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mGET\x1b[30m => \x1b[36m" + req.originalUrl);
    let posts: SupraDrive[] = await sqlSupraDrive.SupraDriveGetImageTags(userid, username);
    return res.status(OK).json(posts);
}

export async function SupraDriveGetImageLocationTags(req: Request, res: Response) {
    const ts = moment(new Date()).format("DD.MM.YYYY HH:mm:ss");
    const supradriveuser = (req as any).user;
    const userid = supradriveuser.userid;
    const username = supradriveuser.username;
    console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[32mOK\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mGET\x1b[30m => \x1b[36m" + req.originalUrl);
    let posts: SupraDrive[] = await sqlSupraDrive.SupraDriveGetImageLocationTags(userid, username);
    return res.status(OK).json(posts);
}

export async function SupraDriveGetImageUserTags(req: Request, res: Response) {
    const ts = moment(new Date()).format("DD.MM.YYYY HH:mm:ss");
    const supradriveuser = (req as any).user;
    const userid = supradriveuser.userid;
    const username = supradriveuser.username;
    console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[32mOK\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mGET\x1b[30m => \x1b[36m" + req.originalUrl);
    let posts: SupraDrive[] = await sqlSupraDrive.SupraDriveGetImageUserTags(userid, username);
    return res.status(OK).json(posts);
}

export async function SupraDriveAddImageTag(req: Request, res: Response) {
    const ts = moment(new Date()).format("DD.MM.YYYY HH:mm:ss");
    const supradriveuser = (req as any).user;
    const userid = supradriveuser.userid;
    const username = supradriveuser.username;
    console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[32mOK\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mGET\x1b[30m => \x1b[36m" + req.originalUrl);
    let posts: SupraDrive[] = await sqlSupraDrive.SupraDriveAddImageTag(userid, username, parseInt(req.params.imageid), req.body);
    return res.status(OK).json(posts);
}

export async function SupraDriveAddImageUserTag(req: Request, res: Response) {
    const ts = moment(new Date()).format("DD.MM.YYYY HH:mm:ss");
    const supradriveuser = (req as any).user;
    const userid = supradriveuser.userid;
    const username = supradriveuser.username;
    console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[32mOK\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mGET\x1b[30m => \x1b[36m" + req.originalUrl);
    let posts: SupraDrive[] = await sqlSupraDrive.SupraDriveAddImageUserTag(userid, username, parseInt(req.params.imageid), req.body);
    return res.status(OK).json(posts);
}

export async function SupraDriveAddImageLocationTag(req: Request, res: Response) {
    const ts = moment(new Date()).format("DD.MM.YYYY HH:mm:ss");
    const supradriveuser = (req as any).user;
    const userid = supradriveuser.userid;
    const username = supradriveuser.username;
    console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[32mOK\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mGET\x1b[30m => \x1b[36m" + req.originalUrl);
    let posts: SupraDrive[] = await sqlSupraDrive.SupraDriveAddImageLocationTag(userid, username, parseInt(req.params.imageid), req.body);
    return res.status(OK).json(posts);
}

export async function SupraDriveRemoveImageTag(req: Request, res: Response) {
    const ts = moment(new Date()).format("DD.MM.YYYY HH:mm:ss");
    const supradriveuser = (req as any).user;
    const userid = supradriveuser.userid;
    const username = supradriveuser.username;
    console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[32mOK\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mGET\x1b[30m => \x1b[36m" + req.originalUrl);
    let posts: SupraDrive[] = await sqlSupraDrive.SupraDriveRemoveImageTag(userid, username, parseInt(req.params.imageid), parseInt(req.params.tagid));
    return res.status(OK).json(posts);
}

export async function SupraDriveRemoveImageUserTag(req: Request, res: Response) {
    const ts = moment(new Date()).format("DD.MM.YYYY HH:mm:ss");
    const supradriveuser = (req as any).user;
    const userid = supradriveuser.userid;
    const username = supradriveuser.username;
    console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[32mOK\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mGET\x1b[30m => \x1b[36m" + req.originalUrl);
    let posts: SupraDrive[] = await sqlSupraDrive.SupraDriveRemoveImageUserTag(userid, username, parseInt(req.params.imageid), parseInt(req.params.tagid));
    return res.status(OK).json(posts);
}

export async function SupraDriveRemoveImageLocationTag(req: Request, res: Response) {
    const ts = moment(new Date()).format("DD.MM.YYYY HH:mm:ss");
    const supradriveuser = (req as any).user;
    const userid = supradriveuser.userid;
    const username = supradriveuser.username;
    console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[32mOK\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mGET\x1b[30m => \x1b[36m" + req.originalUrl);
    let posts: SupraDrive[] = await sqlSupraDrive.SupraDriveRemoveImageLocationTag(userid, username, parseInt(req.params.imageid), parseInt(req.params.tagid));
    return res.status(OK).json(posts);
}

export async function SupraDriveAuthLogin(req: Request, res: Response) {
    const ts = moment(new Date()).format("DD.MM.YYYY HH:mm:ss");
    const ip = req.headers['x-forwarded-for']
        ? (Array.isArray(req.headers['x-forwarded-for']) ? req.headers['x-forwarded-for'][0] : req.headers['x-forwarded-for'].split(',')[0])
        : req.socket.remoteAddress;
    const clientIp = ip ? ip.trim() : null;
    const obj = JSON.parse(JSON.stringify(req.body));
    var username = "";
    var userpassword = "";
    if (obj.username) {
        username = obj.username;
    }
    if (obj.password) {
        userpassword = obj.password;
    }
    try {
        var [authuser] = await supradrive.query(`SELECT userid,username,password FROM \`users\` u WHERE u.username=? AND u.wiped="0"`, [username]);
    } catch (e) {
        console.log(e);
    }
    if (typeof (authuser[0]) == 'undefined') {
        return res.status(403).send("Access denied");
    }

    var dbuserid = authuser[0].userid;
    var dbuser = authuser[0].username;
    var dbpass = authuser[0].password;
    if (username && (await bcrypt.compare(userpassword, dbpass))) {
        const token = jwt.sign(
            { userid: dbuserid, username: dbuser },
            process.env.SUPRADRIVE_SECRET_TOKENKEY,
            { algorithm: 'HS256' },
            { expiresIn: "48h" }
        );
        let options = {
            maxAge: 1000 * 60 * 1440,
            httpOnly: true,
            secure: true,
            signed: false
        }
        res.cookie('supratvtoken', token, options).status(200).json({ token: token, userid: dbuserid, username: dbuser });
    }
    else {
        console.log("login request from " + clientIp + " username: " + username + " ERROR");
        res.status(403).send("Access denied");
    }

}


