import crypto from "crypto"

const digs = "0123456789";
const spChars = "!@#$%^&*-+/";
const bigs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const smalls = "abcdefghijklmnopqrstuvwxyz";

const arr = digs + spChars + bigs + smalls;

function generateSession()
{
    let session = "";

    for (let i = 0; i < 48; i++)
    {
        const idx = crypto.randomInt(0, arr.length);
        session += arr[idx];
    }

    return session;
}

export default generateSession