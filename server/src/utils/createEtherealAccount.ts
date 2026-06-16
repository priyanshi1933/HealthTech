import nodemailer from "nodemailer";

const create = async () => {
  const account = await nodemailer.createTestAccount();
  console.log("─────────────────────────────────────");
  console.log("ETHEREAL_USER =", account.user);
  console.log("ETHEREAL_PASS =", account.pass);
  console.log("Inbox: https://ethereal.email/messages");
  console.log("─────────────────────────────────────");
};

create();
