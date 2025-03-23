import { injectable } from "tsyringe";
import nodemailer from "nodemailer";
import { IEmailService } from "../../entities/services/email-service.interface";
import { config } from "../../shared/config";
import {  VERIFICATION_MAIL_CONTENT,PASSWORD_RESET_MAIL_CONTENT } from "../../shared/constants";

@injectable()
export class EmailService implements IEmailService {
	private transporter;

	constructor() {
		this.transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: config.nodemailer.EMAIL_USER,
				pass: config.nodemailer.EMAIL_PASS,
			},
		});
	}

	async sendOtpEmail(
		to: string,
		subject: string,
		otp: string
	): Promise<void> {
		const mailOptions = {
			from: `"StriveX" <${config.nodemailer.EMAIL_USER}>`,
			to,
			subject,
			html: VERIFICATION_MAIL_CONTENT(otp),
		};
		await this.transporter.sendMail(mailOptions);
	}
	
	async sendResetEmail(
		to: string,
		subject: string,
		resetLink: string
	): Promise<void> {
		const mailOptions = {
			from: `"StriveX" <${config.nodemailer.EMAIL_USER}>`,
			to,
			subject,
			html: PASSWORD_RESET_MAIL_CONTENT(resetLink),
		}
		await this.transporter.sendMail(mailOptions);
	}

	async sendEmail(to: string, subject: string, content: string): Promise<void> {
		const mailOptions = {
			from: `"StriveX" <${config.nodemailer.EMAIL_USER}>`,
			to,
			subject,
			html: content, 
		  };
		  await this.transporter.sendMail(mailOptions);
	}
}
