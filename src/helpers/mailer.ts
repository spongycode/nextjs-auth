import nodemailer from 'nodemailer';
import User from "@/models/userModel";
import bcryptjs from 'bcryptjs';


export const sendEmail = async ({ email, emailType, userId }: any) => {
    try {
        // create a hased token
        const hashedToken = await bcryptjs.hash(userId.toString(), 10)

        if (emailType === "VERIFY") {
            await User.findByIdAndUpdate(userId,
                { verifyToken: hashedToken, verifyTokenExpiry: Date.now() + 3600000 })
        } else if (emailType === "RESET") {
            await User.findByIdAndUpdate(userId,
                { forgotPasswordToken: hashedToken, forgotPasswordTokenExpiry: Date.now() + 3600000 })
        }

        var transport = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: emailType === "VERIFY" ? "Verify your email" : "Reset your password",
            html: emailType === "VERIFY" ?
                `<p>Click <a href="${process.env.DOMAIN}/verifyemail?token=${hashedToken}">here</a> 
                to verify your email or copy and paste the link below in your browser. 
                <br> ${process.env.DOMAIN}/verifyemail?token=${hashedToken}
                </p>`
                :
                `<p>Click <a href="${process.env.DOMAIN}/password?token=${hashedToken}">here</a> 
                to reset your password or copy and paste the link below in your browser. 
                <br> ${process.env.DOMAIN}/password?token=${hashedToken}
                </p>`
        }

        const mailresponse = await transport.sendMail
            (mailOptions);
        console.log(mailresponse);

        return mailresponse;

    } catch (error: any) {
        throw new Error(error.message);
    }
}