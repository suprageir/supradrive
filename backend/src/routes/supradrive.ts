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

interface MulterRequest extends Request {
    file?: any;
}

export async function SupraDriveAuthToken(req: Request, res: Response) {
    const ts = moment(new Date()).format("DD.MM.YYYY HH:mm:ss");
    const ip = req.headers['x-forwarded-for']
        ? (Array.isArray(req.headers['x-forwarded-for']) ? req.headers['x-forwarded-for'][0] : req.headers['x-forwarded-for'].split(',')[0])
        : req.socket.remoteAddress;
    const clientIp = ip ? ip.trim() : null;
    return res.status(OK).json({ message: 'Token is valid' });
}

export async function SupraDriveNewFolder(req: Request, res: Response) {
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
        let posts: SupraDrive[] = await sqlSupraDrive.SupraDriveFolderNew(userid, username, req.body);
        return res.status(OK).json(posts);
    }
    else {
        console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[31mERROR\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mGET\x1b[30m => \x1b[36m" + req.originalUrl + " \x1b[30m(" + ip + ")\x1b[0m");
        return res.status(BAD_REQUEST);
    }
}

export async function SupraDriveNewImagesFolder(req: Request, res: Response) {
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
        let posts: SupraDrive[] = await sqlSupraDrive.SupraDriveNewImagesFolder(userid, username, req.body);
        return res.status(OK).json(posts);
    }
    else {
        console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[31mERROR\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mGET\x1b[30m => \x1b[36m" + req.originalUrl + " \x1b[30m(" + ip + ")\x1b[0m");
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
            console.log(posts);
            return res.status(OK).json(posts);
        }
        else {
            console.log(posts);
            return res.status(BAD_REQUEST).json(posts);
        }
    }
    else {
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

export async function SupraDriveGetImagesFolder(req: Request, res: Response) {
    const ts = moment(new Date()).format("DD.MM.YYYY HH:mm:ss");
    const ip = req.headers['x-forwarded-for']
        ? (Array.isArray(req.headers['x-forwarded-for']) ? req.headers['x-forwarded-for'][0] : req.headers['x-forwarded-for'].split(',')[0])
        : req.socket.remoteAddress;
    const clientIp = ip ? ip.trim() : null;
    const supradriveuser = (req as any).user;
    const userid = supradriveuser.userid;
    const username = supradriveuser.username;

    if (req.params.foldersubid) {
        console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[32mOK\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mPOST\x1b[30m => \x1b[36m" + req.originalUrl + " \x1b[30m(" + ip + ")\x1b[0m");
        let posts: SupraDrive[] = await sqlSupraDrive.SupraDriveGetImagesFolder(userid, username, parseInt(req.params.foldersubid));
        return res.status(OK).json(posts);
    }
    else {
        console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[31mERROR\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mGET\x1b[30m => \x1b[36m" + req.originalUrl + " \x1b[30m(" + ip + ")\x1b[0m");
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
    const ip = req.headers['x-forwarded-for']
        ? (Array.isArray(req.headers['x-forwarded-for']) ? req.headers['x-forwarded-for'][0] : req.headers['x-forwarded-for'].split(',')[0])
        : req.socket.remoteAddress;
    const clientIp = ip ? ip.trim() : null;
    const supradriveuser = (req as any).user;
    const userid = supradriveuser.userid;
    const username = supradriveuser.username;

    if (req.params.fileid) {
        console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[32mOK\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mPOST\x1b[30m => \x1b[36m" + req.originalUrl + " \x1b[30m(" + ip + ")\x1b[0m");
        let posts: SupraDrive[] = await sqlSupraDrive.SupraDriveGetImage(userid, username, parseInt(req.params.fileid));
        return res.status(OK).json(posts);
    }
    else {
        console.log("\x1b[1m\x1b[30m[" + ts + "] [\x1b[31mERROR\x1b[30m] [\x1b[35m" + username + "\x1b[30m] => \x1b[32mGET\x1b[30m => \x1b[36m" + req.originalUrl + " \x1b[30m(" + ip + ")\x1b[0m");
        return res.status(BAD_REQUEST);
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
        console.log("login request from " + clientIp + " username: " + username + " token: " + token + " OK");
        res.cookie('supratvtoken', token, options).status(200).json({ token: token, userid: dbuserid, username: dbuser });
    }
    else {
        console.log("login request from " + clientIp + " username: " + username + " ERROR");
        res.status(403).send("Access denied");
    }

}


