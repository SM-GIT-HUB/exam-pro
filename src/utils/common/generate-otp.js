import crypto from "crypto"

const digs = "0123456789";
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const arr = digs + chars;

function generateOtp()
{
    let otp = "";

    for (let i = 0; i < 8; i++)
    {
        const idx = crypto.randomInt(0, arr.length);
        otp += arr[idx];
    }

    return otp;
}

export default generateOtp