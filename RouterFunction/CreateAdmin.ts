import { Request, Response } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { Admin } from "../Models/Admin";
import CheckAdmin from "../Functions/CheckAdmin";

export default async function createAdmin(req: Request<{}, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>, number>) {
	const regexSHA512 = /^[a-fA-F0-9]{128}$/;

	if (typeof req.body != 'object' || Object.keys(req.body).length != 4) {
		res.status(400).send({ status: 400, message: "specify admin object" });
		return;
	}

	if (!await CheckAdmin(req, res)) {
		return;
	}

	if (!req.body.name || typeof req.body.name != 'string') {
		res.status(400).send({ status: 400, message: "username must be a string" });
		return;
	} if (!req.body.email || typeof req.body.email != 'string') {
		res.status(400).send({ status: 400, message: "email must be a string" });
		return;
	} if (req.body.email.length == 0) {
		res.status(400).send({ status: 400, message: "email must be a string" });
		return;
	} if (!req.body.password || req.body.password.length != 128 || !regexSHA512.test(req.body.password)) {
		res.status(400).send({ status: 400, message: 'the password must be sha512' })
		return;
	}

	if (await Admin.findOne({ email: req.body.email })) {
		res.status(409).send({ status: 409, message: "Admin with email " + req.body.email + " already exists" });
		return;
	}
	const admin = new Admin({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password
	});
	await admin.save();
	res.send('Admin ' + admin.email + ' created');
}
