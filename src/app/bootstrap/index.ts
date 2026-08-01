import {Express} from 'express';
import {expressServer} from './express/expressServer';
import { dbConnection } from './mongoose/db';

export async function bootStrapApp(app: Express, PORT: number) {
    await dbConnection();
    expressServer(app, PORT);
}