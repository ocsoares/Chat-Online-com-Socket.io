import 'dotenv/config';
import mongoose from 'mongoose';

export const connectionAtlas = async () => {
    try {
        await mongoose.connect(process.env.ATLAS_URL as string);
        console.log('Conectado ao Atlas DB !');
    }
    catch (error: any) {
        console.log(error.message);
        process.exit(1);
    }
};