import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { AuthUser } from './auth.types';
import { JWT_EXPIRES_IN_SECONDS, JWT_SECRET } from './auth.constants';

interface TokenPayload extends AuthUser {
    iat: number;
    exp: number;
}

@Injectable()
export class JwtService {
    sign(user: AuthUser): string {
        const now = Math.floor(Date.now() / 1000);
        const payload: TokenPayload = {
            ...user,
            iat: now,
            exp: now + JWT_EXPIRES_IN_SECONDS,
        };

        const header = { alg: 'HS256', typ: 'JWT' };
        const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
        const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
        const signature = this.signRaw(`${encodedHeader}.${encodedPayload}`);

        return `${encodedHeader}.${encodedPayload}.${signature}`;
    }

    verify(token: string): AuthUser {
        const [encodedHeader, encodedPayload, signature] = token.split('.');
        if (!encodedHeader || !encodedPayload || !signature) {
            throw new UnauthorizedException('Token inválido.');
        }

        const expectedSignature = this.signRaw(`${encodedHeader}.${encodedPayload}`);
        if (!this.safeEquals(signature, expectedSignature)) {
            throw new UnauthorizedException('Token inválido.');
        }

        const payload = JSON.parse(this.base64UrlDecode(encodedPayload)) as TokenPayload;
        if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
            throw new UnauthorizedException('Sesión expirada.');
        }

        return {
            sub: payload.sub,
            email: payload.email,
            rol: payload.rol,
            business_id: payload.business_id,
        };
    }

    private signRaw(value: string): string {
        return createHmac('sha256', JWT_SECRET).update(value).digest('base64url');
    }

    private base64UrlEncode(value: string): string {
        return Buffer.from(value).toString('base64url');
    }

    private base64UrlDecode(value: string): string {
        return Buffer.from(value, 'base64url').toString('utf8');
    }

    private safeEquals(left: string, right: string): boolean {
        const leftBuffer = Buffer.from(left);
        const rightBuffer = Buffer.from(right);
        return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
    }
}
