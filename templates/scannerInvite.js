exports.scannerInvite = (scanner, event, url) => {
    const date = new Date(event.eventDate);
    return (`<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
            <link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet">
            <title>Invitation to LEXPULSE</title>

            <style type="text/css">
                img {
                    max-width: 100%;
                }
                body {
                    font-family: 'Open Sans', Helvetica, Sans-Serif;
                    -webkit-font-smoothing: antialiased;
                    -webkit-text-size-adjust: none;
                    width: 100% !important;
                    height: 100%;
                    line-height: 1.6em;
                    background-color: #F5F7FB;
                    margin: 0;
                }
                .container {
                    width: 100%;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .main {
                    width: 100%;
                    border-radius: 8px;
                    background-color: #FFFFFF;
                    box-shadow: 0 2px 21px 0 rgba(0,112,224,0.12);
                    border: 8px solid #FFFFFF;
                }
                .content-wrap {
                    padding: 20px;
                    color: #25265E;
                }
                button, a.button {
                    background-color: #0070E0;
                    color: white;
                    padding: 12px 20px;
                    text-align: center;
                    text-decoration: none;
                    border-radius: 4px;
                    display: inline-block;
                    font-size: 16px;
                    cursor: pointer;
                }
                a {
                    text-decoration: none;
                    color: inherit;
                }
                @media only screen and (max-width: 640px) {
                    .container {
                        padding: 10px !important;
                    }
                    .content-wrap {
                        padding: 10px !important;
                    }
                    h1, h2, h3, h4 {
                        font-weight: 800 !important;
                        margin: 20px 0 5px !important;
                    }
                    h1 { font-size: 22px !important; }
                    h2 { font-size: 18px !important; }
                    h3 { font-size: 16px !important; }
                    .main {
                        padding: 10px;
                    }
                }
            </style>
        </head>
        <body>
            <table class="container">
                <tr>
                    <td>
                        <table class="main">
                            <tr>
                                <td align="center">
                                    <img src="https://res.cloudinary.com/dhfif2kjc/image/upload/v1703946360/logo_muinkl.png" alt="Lexpulse" height="40" width="150">
                                    <hr width="90%" style="border: solid 0.5px #eaeef6;">
                                </td>
                            </tr>
                            <tr align="center">
                                <td class="content-wrap">
                                    <p>Hello ${scanner.name},</p>
                                    <p>You have been invited as a scanner for <strong>${event.eventName}</strong> on <strong>${date.toDateString()}</strong> at <strong>${date.toTimeString()}</strong>.</p>
                                    <p>Below is your invitation link. Please do not share this link with anyone. The link is only valid for 24 hours.</p>
                                    <a href="${url}" class="button" style="color: #584cf4">Register</a>
                                    <p style="text-align: center; color: #000; font-size: 10px; margin-top: 10px;">${url}</p>
                                    <hr style="border: solid 0.5px #eaeef6;">
                                </td>
                            </tr>
                            <tr align="center">
                                <td class="content-wrap">
                                    <p>Have any questions? Email us at: <a href="mailto:thelexpulseteam@fadorteclimited.com" style="color:#0070E0;">thelexpulseteam@fadorteclimited.com</a></p>
                                </td>
                            </tr>
                        </table>
                        <table width="100%">
                            <tr>
                                <td align="center">
                                    <p style="color: #25265E; font-size: 14px;">Copyright © 2024 Lexpulse. All Rights Reserved</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
    </html>`);
};