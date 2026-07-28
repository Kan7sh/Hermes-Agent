import express, {Router} from 'express';
import cors from 'cors';
import {Express, NextFunction, Response, Request} from 'express';
import { handleExpressError } from '../exceptions/handleExpressError';
import passport from 'passport';
import session from 'express-session';
import {Strategy as GoogleStrategy} from "passport-google-oauth20";
import MongoStore from "connect-mongo";;

export function expressServer(app:Express,PORT:number){
    const router = Router();

    app.use(cors({
        origin:"*",
        credentials:true
    }));

    app.use(express.json())
    app.use(express.urlencoded({extended:true}))

    app.use(handleExpressError);

    app.get('/',async(req:Request,res:Response)=>{
        res.json({message:'server is up'});
    })

    app.listen(PORT,()=>{
        console.log(`Express server is running at http://localhost:${PORT}`)
    })


    const sess = {
        store:MongoStore.create({
            mongoUrl:process.env.DB_URL,
            collectionName:"sessions"
        }),
        secret:process.env.COOKIE_KEY as string,
        resave:false,
        saveUninitialized: true,
        cookie:{secure:false}
    }


    if(process.env.NODE_ENV==='production'){
        app.set('trust proxy',1);
        sess.cookie.secure = true;
    }

    app.use(session(sess));
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(
        new GoogleStrategy(
            {
                clientID:process.env.GOOGLE_CLIENT_ID as string,
                clientSecret:process.env.GOOGLE_CLIENT_SECRET as string,
                callbackURL:process.env.CALL_BACK_URL
            },
            async (accessToken:string,refreshToken:string,profile:any,done:any)=>{
                console.log("Create user...",profile)
                return done(null,{})
            }
        )
    )


    passport.serializeUser((user:any,done)=>{
        done(null,user);
    });

    passport.deserializeUser(async (obj:any,done)=>{
        try{
            done(null,obj);
        }catch(err){
            done(err);
        }
    })

    app.get(
        "/auth/google",
        passport.authenticate("google",{
            scope:[
                "profile",
                "email"
            ],
            accessType:"offline",
            prompt:"consent"
        })
    )

    app.get(
        "/auth/google/callback",
        passport.authenticate("google",{
            failureRedirect:"/auth/login",
            successRedirect:process.env.FRONT_APP_URL
        })
    )

    app.get("/auth/me",(req:any,res:any)=>{
        if(!req.user) return res.status(401).json({error:"Not Logged in"});
        res.json(req.user);

    })

}
