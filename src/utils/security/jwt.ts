import type { TokenPayload } from "@/types/common";
import { SignJWT, decodeJwt, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export const signToken = async (id: string, email: string): Promise<string> => {
    return await new SignJWT({ id, email })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .setJti(crypto.randomUUID())
        .sign(secret);
};

export const verifyToken = async (token: string): Promise<TokenPayload> => {
    const { payload } = await jwtVerify(token, secret);
    return payload as TokenPayload;
};

export const decodeToken = (token: string): TokenPayload => {
    return decodeJwt(token) as TokenPayload;
}