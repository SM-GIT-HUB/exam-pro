import { NodeMailer } from "../../config/index.js";

export async function sendSignupOtpMail(toEmail, otp) {
    try {
        const info = await NodeMailer.transporter.sendMail({
            from: `"Exam Pro" <${process.env.SMTP_USER}>`,
            to: toEmail,
            subject: "Signup using this otp in ExamPro",
            text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
            html: `<p>Your OTP code is <b>${otp}</b>. It is valid for 5 minutes.</p>`
        })

        return true;
    }
    catch(err) {
        return false;
    }
}
