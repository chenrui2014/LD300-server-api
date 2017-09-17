/**
 * Created by chen on 17-8-21.
 */
import mongoose from 'mongoose';
import logger from '../logger';
import config from '../config';

export default function connect() {

    return new Promise((resolve, reject) => {
        mongoose.Promise = global.Promise;
        mongoose.connection
            .on('error', (error) => reject(error))
            .on('close', () => logger.info('Database connection closed.'))
            .on('open', () => resolve(mongoose.connections[0]));

        mongoose.connect(config.mongo.uri, config.mongo.options);
    });
}