import { NextFunction,Response,Request } from "express";
import jwt from 'jsonwebtoken';
import {Types} from 'mongoose';

function jwtPayload(userId:Types.ObjectId){
    const payload = {
        iss:null,
        sub:userId,
        aud:userId,
        exp:Math.floor(Date.now()/1000)+60*60+60*60,
        iat:Math.floor(Date.now()/1000)
    };

    return payload;
}

export function signAccessToken(userId:Types.ObjectId){
    const payload = jwtPayload(userId);
    const key = process.env.JWT_TOKEN_KEY as string
    return new Promise((resolve,reject)=>{
        (jwt as any).sign(payload,key,(error:Error,token:string)=>{
            if(error){
                reject(error);
            }
            resolve(token);
        })
    })
}

export function  signRefreshToken(userId:Types.ObjectId){
    const payload = jwtPayload(userId);
    const key = process.env.REFRESH_TOKEN_KEY as string;
 return new Promise((resolve,reject)=>{
        jwt.sign(payload,key,(error,token)=>{
            if(error){
                reject(error);
            }
            resolve(token);
        })
    })
}


export async function VerifyExpressToken(req:Request,res:Response,next:NextFunction){
    try{
        const token = req.headers?.authorization as string;
        const accessToken = token.split(" ")[1];
        const key = process.env.JWT_TOKEN_KEY as string;
        jwt.verify(accessToken,key,(error,payload)=>{
            if(error){
                throw new Error('unauthorized')
            }else{
                next()
            }
        });
    }catch(error){
        res.status(401).send({message:"unauthorized"});
    }
}

export async function generateTokens(userId:Types.ObjectId){
    const [accessToken,refreshToken] = await Promise.all([
        signAccessToken(userId),
        signRefreshToken(userId)
    ])

    return{
        accessToken,refreshToken
    }
}