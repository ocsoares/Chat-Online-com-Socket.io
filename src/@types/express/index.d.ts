declare namespace Express {
    import { JwtPayload } from "jsonwebtoken";
    interface Request {
        JWT: JwtPayload;
    }
}