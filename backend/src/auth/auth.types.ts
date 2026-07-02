import { Request } from 'express';

export interface AuthUser {
    sub: string;
    email: string;
    rol: string;
    business_id: string | null;
}

export interface AuthenticatedRequest extends Request {
    user?: AuthUser;
}
