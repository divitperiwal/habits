import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export const signToken = async (id: string, email: string): Promise<string> => {
    return await new SignJWT({ id, email })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secret);
};

export const verifyToken = async (token: string) => {
    const { payload } = await jwtVerify(token, secret);
    return payload;
};