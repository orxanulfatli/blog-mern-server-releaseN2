import { Twilio } from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_PHONE_NUMBER;
const serviceID = process.env.TWILIO_SERVICE_ID;

const getTwilioClient = () => {
  if (!accountSid || !authToken) {
    throw new Error("Twilio env vars are missing: TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN");
  }

  if (!accountSid.startsWith("AC")) {
    throw new Error("TWILIO_ACCOUNT_SID must start with AC");
  }

  return new Twilio(accountSid, authToken);
};

export const sendSms = (to:string,body:string,txt:string) => {
     try {
         if (!from) throw new Error("TWILIO_PHONE_NUMBER is missing");
         const client = getTwilioClient();
         client.messages
             .create({
                 body: `BlogDev ${txt} - ${body}`,
                 from,
                 to,
             })
             .then(message => console.log(message.sid));
     } catch (err) {
        console.log(err)
     }
}

export const smsOTP = async (to: string, channel: string) => {
    try {
        if (!serviceID) throw new Error("TWILIO_SERVICE_ID is missing");
        const client = getTwilioClient();
        const data = await client
            .verify
            .services(serviceID)
            .verifications
            .create({
                to,
                channel
            })

        return data;
    } catch (err) {
        console.log(err)
    }
}

export const smsVerify = async (to: string, code: string) => {
    try {
        if (!serviceID) throw new Error("TWILIO_SERVICE_ID is missing");
        const client = getTwilioClient();
        const data = await client
            .verify
            .services(serviceID)
            .verificationChecks
            .create({
                to,
                code
            })

        return data;
    } catch (err) {
        console.log(err)
    }
}

