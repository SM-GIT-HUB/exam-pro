
const digs = "0123456789";
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const arr = [digs, chars];

function generateOtp()
{
    let otp = "";

    for (let i = 0; i < 8; i++)
    {
        const idx = Math.floor(Math.random() * 2);
        const ch = arr[idx][Math.floor(Math.random() * arr[idx].length)];
        otp += ch;
    }

    return otp;
}

export default generateOtp