import { NodeMailer } from "../../config/index.js"

export async function sendOtpMail(toEmail, otp) {
    try {
        const info = await NodeMailer.transporter.sendMail({
            from: `"Exam Pro" <${process.env.SMTP_USER}>`,
            to: toEmail,
            subject: "Use this otp in ExamPro to continue",
            text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
            html: `<p>Your OTP code is <b>${otp}</b>. It is valid for 5 minutes. Hurry Up!!!</p>`
        })

        return true;
    }
    catch(err) {
        return false;
    }
}
