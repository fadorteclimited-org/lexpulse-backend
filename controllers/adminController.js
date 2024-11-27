const Admin = require('../models/adminModel');
const Otp = require('../models/otpModel');
const moment = require('moment');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const postmark = require("postmark");
const { updateBalance } = require("../utils/helper");
const process = require("node:process");
const console = require("node:console");
const Scanner = require("../models/scannerModel");
const Event = require("../models/eventModel");
const {scannerInvite} = require("../templates/scannerInvite");
const {adminInvite} = require("../templates/adminInvite");
const {name, role} = require("node-openssl-cert/name_mappings");
const client = new postmark.ServerClient(process.env.POSTMARK_EMAIL_KEY);

// @desc Auth admin
// @route POST /api/v1/admin/auth
exports.checkAdmin = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ msg: 'Please enter all fields' });
        }

        const admin = await Admin.findOne({ username }).exec();

        if (!admin) return res.status(400).json({ msg: 'Admin does not exist' });
        if (admin.activatedEmail === false) return res.status(400).json({ msg: 'Email not verified' });

        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
        console.log(admin);

        jwt.sign(
            { ...admin, role: admin.role, id: admin.id },
            process.env.JWT_SECRET,
            { expiresIn: '365d' },
            (err, token) => {
                if (err) throw err;

                return res.json({
                    token,
                    user: {
                        ...admin.toJSON(),
                        id: admin.id,
                    }
                });
            }
        );

    } catch (error) {
        console.log(error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);

            return res.status(400).json({
                success: false,
                error: messages
            });
        } else {
            return res.status(500).json({
                success: false,
                error: 'Internal Server Error'
            });
        }
    }
}

// @desc Auth admin confirm email
// @route POST /api/v1/admin/auth/confirm-code
exports.checkAdminVerification = async (req, res, next) => {
    try {
        const { username, code } = req.body;

        if (!username || !code) {
            return res.status(400).json({ msg: 'Please enter all fields' });
        }

        Admin.findOne({ username })
            .then(async (user) => {
                if (!user) return res.status(400).json({ msg: 'Admin does not exist' });

                const otpCode = await Otp.findOne({ userId: user.id });

                if (moment() > moment(otpCode.expiredAt)) return res.status(400).json({ msg: 'Code expired' });

                if (otpCode.activateCode !== Number(code)) return res.status(400).json({ msg: 'Invalid code' });

                const userNew = await Admin.findByIdAndUpdate(user._id, {
                    activatedEmail: true
                }, { new: true });

                jwt.sign(
                    { id: user.id },
                    process.env.JWT_SECRET,
                    { expiresIn: '7d' },
                    (err, token) => {
                        if (err) throw err;
                        res.json({
                            token,
                            user: {
                                id: userNew.id,
                                firstName: userNew.firstName,
                                lastName: userNew.lastName,
                                username: userNew.username,
                                country: userNew.country,
                                gender: userNew.gender,
                                userType: userNew.userType,
                                image: userNew.image,
                                organization: userNew.organization,
                                phone: userNew.phone,
                                activatedEmail: userNew.activatedEmail,
                                activatedPhone: userNew.activatedPhone,
                                accountActive: userNew.accountActive,
                                createdAt: userNew.createdAt
                            }
                        });
                    }
                );
            });

    } catch (error) {
        console.log(error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);

            return res.status(400).json({
                success: false,
                error: messages
            });
        } else {
            return res.status(500).json({
                success: false,
                error: 'Internal Server Error'
            });
        }
    }
}

// @desc Auth admin confirm email
// @route POST /api/v1/admin/create
exports.createAdmin = async (req, res, next) => {
    try {
        const {name, email, role} = req.body;

        const newAdmin = new Admin({
            name,
            email,
            role,
            activated: false,
        });
        const savedAdmin = await newAdmin.save();
        return res.status(201).json(savedAdmin);
    } catch (e) {

    }
}

// @desc Activate admin account
// @route POST /api/v1/admins/invite/:id
exports.sendAdminInvite = async (req, res, next) => {

    try {
        const {  id } = req.params;
        const admin = await Admin.findById(id).exec();
        const actionCode = jwt.sign({admin}, process.env.JWT_SECRET,{expiresIn: '24h'});
        const message = adminInvite(admin,`https://lexpulse-admin.vercel.app/register?oob=${actionCode}`)
        const emailSend = await client.sendEmail(
            {
                "From": "thelexpulseteam@fadorteclimited.com",
                "To": admin.email,
                "Subject": "Admin Invite",
                "HtmlBody": message,
                "MessageStream": "outbound"
            }
        )
        res.status(200).json({
            success: true,
            message: 'Invitation sent successfully'
        });
    } catch (e) {

    }
}


// @desc Activate admin account
// @route GET /api/v1/admins/invite/:id
exports.processAdminInvite = async (req, res, next) => {
    try {
        const admin = jwt.verify(req.params.id, process.env.JWT_SECRET);
        if (!admin) {
            return res.status(404).json({
                success: false,
                error: 'Admin not found'
            });
        }
        return res.status(200).json({
            success: true,
            data: admin
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: 'Invalid token or token expired'
        });
    }
};

// @desc Activate admin account
// @route POST /api/v1/admins/activate
exports.activateAdmin = async (req, res, next) => {
    try {
        const {username, email, password} = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({msg: 'Please enter all required fields.'});
        }

        const admin = await Admin.findOne({email});

        if (!admin) {
            return res.status(404).json({
                success: false,
                error: 'Admin not found'
            });
        }

        if (admin.password) {
            return res.status(400).json({
                success: false,
                error: 'Account is already activated'
            });
        }
        const salt = await bcrypt.genSalt(10);

        const hash = await bcrypt.hash(password, salt);
        admin.username = username;
        admin.password = hash;
        admin.activated = true;
        await admin.save();

        return res.status(200).json({
            success: true,
            message: 'Account activated',
            data: admin,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
};