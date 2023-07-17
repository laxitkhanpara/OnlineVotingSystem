const express = require('express')
const app = express();
const router = express.Router();
const bcrypt = require('bcrypt');
var { Country, State, City } = require("country-state-city");
const multer = require('multer');
const path = require("path")
const changeCase = require('change-case');
// const { checkUserAuth } = require("../middleware/authMiddleware");
const { genrateTocken } = require('../middleware/jwtToken');
const { SignUp } = require("../models/AccountsSchema")
const { VoterDetails, CandidateDetails, Election, Stages } = require("../models/GiveVoteSchema")
const otpGenerator = require('otp-generator');
const { json } = require('body-parser');

const { checkUserAuth } = require("../middleware/authMiddleware");
const { log } = require('console');





//(1)=======twilio===========================================================
// const accountSid = 'AC231928fe56d2d5b8537d905c6d24ed19';
// const authToken = '7b7154ba8dbb3a9af3409473f5196997';
//=========================================================================

//(2)=======twilio===========================================================
const accountSid = 'ACf762eb1d167224ab9f0effa8587c7119';
const authToken = '91789d371b6da37a15196eaadafe6440';
//=========================================================================
const client = require('twilio')(accountSid, authToken);

//================image upload===============================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log(111, file.originalname);
        cb(null, "./public/upload")
    },
    filename: (req, file, cb) => {
        console.log(file)
        cb(null, Date.now() + path.extname(file.originalname))
    }
})
const upload = multer({ storage: storage });



router.get("/Dashboard", async (req, res) => {
    try {
        const candidate=await CandidateDetails.find({}) 
        const election=await Election.find({})
        console.log("Page loaded");
        res.render("Dashboard",{election,candidate})
    } catch (error) {
        console.log(error);
    }
})



/*-------------------------------------------------------------
VotingSide Prossess
-------------------------------------------------------------*/
{
    router.get("/GiveVote", async (req, res) => {
        try {
            const token = req.cookies.LogIn;
            console.log("token:----", token)
            console.log("Page loaded");
            res.render("GiveVote")
        } catch (error) {
            console.log(error);
        }
    })

    router.post("/GetOtp/ajax", async (req, res) => {
        try {
            console.log("body:", req.body);
            const { VoterId } = req.body;
            const VoterIdno = await VoterDetails.find({ VoterId })
            console.log("--------------", VoterIdno[0].mobile);
            if (VoterIdno) {
                //Genrate otp
                const otpLength = 6; // Change the length as needed
                const otp = otpGenerator.generate(otpLength);
                //send otp
                const phoneNumber = VoterId[0].mobile; // Replace with the recipient's phone number
                const message = `Your OTP is: ${otp}`; // Replace `otp` with your generated OTP
                client.messages
                    .create({
                        body: message,
                        // from: '+12345952714',    [1]
                        from: '+16187875692',
                        to: "+91" + 8238694033,
                    })
                    .then(message => console.log(`OTP sent. Message SID: ${message.sid}`))
                    .catch(error => console.error('Error sending OTP:', error));
                res.json({ otp })
                console.log("otp:", otp);
            } else {
                res.json({ "msg": "Voter not Found" })
            }
        } catch (error) {
            console.log(error);
        }
    })

    router.post("/VerifyOtp", async (req, res) => {
        try {
            
            console.log(req.body);
            const { RealOtp, EnteredOtp, VoterId } = req.body;
            const VoterIdno = await VoterDetails.find({ VoterId })
            console.log("VoterIdno:", VoterIdno);
            console.log("VoterIdno[0].id:", VoterIdno[0].id);

            if (RealOtp == EnteredOtp) {
                const token = genrateTocken(VoterIdno[0].id);
                res.cookie('LogIn', token, process.env.JWT_SECRET, {
                    expires: new Date(Date.now() + 50000),
                    httpOnly: true,
                })
                const findvoterstage = await Stages.find({ Voter: VoterIdno[0].id })
                console.log("findvoterstage:", findvoterstage);
                if (!findvoterstage) {
                    console.log("if-----------------------------------");
                    const addstage = new Stages({
                        Voter: VoterIdno[0].id, stageNumber: 1, Election: [
                            {
                                electionname: null // Assign the desired value to electionname
                            }
                        ]
                    })
                    addstage.save();
                    console.log("addstage:", addstage);
                } else {
                    console.log("else-----------------------------");
                    const update = await Stages.findOneAndUpdate({ Voter: VoterIdno[0].id }, { stageNumber: 1 })
                    res.redirect("/FaceSacan")
                }
            } else {
                res.send({ succsess: false, massage: "Otp is wrong" })
            }
        } catch (error) {
            console.log(error);
        }
    })
}
/*------------------------------------------------------------
addvoter
-------------------------------------------------------------*/
{
    router.get("/AddVoter", async (req, res) => {
        try {
            const countrys = Country.getAllCountries();
            const VoterDetail = await VoterDetails.find({})
            console.log(VoterDetail);
            res.render("AddVoter", { countrys, VoterDetail })
        } catch (error) {
            console.log(error);
        }
    })
    router.post("/AddVoter", upload.single('image'), async (req, res) => {
        try {
            const { mobile, FirstName, LastName, VoterId, Country, State, City, Street, zipCode } = req.body;
            const image = req.file.filename
            const newVoter = new VoterDetails({ image, mobile, FirstName, LastName, VoterId, Country, State, City, Street, zipCode })
            await newVoter.save();
            res.redirect("/AddVoter")
        } catch (error) {
            console.log(error);
        }
    })
    router.put("/VoterUpdate/:id", async (req, res) => {

    })
    router.delete("/Voter/delete/:id", async (req, res) => {
        try {
            await VoterDetails.findByIdAndDelete(req.params.id)
        } catch {
            res.send({ succsess: false, massage: "Somthing is wrong" })
        }
    })
    //==============state/ajax===================
    router.get("/state/ajax/:id", async (req, res) => {
        try {
            const states = State.getStatesOfCountry(req.params.id)
            console.log("states:", states);

            res.json({ states })
        } catch (error) {
            console.log(error);
        }
    })
    //==============city/ajax===================

    router.post("/city/ajax", async (req, res) => {
        try {
            // console.log(req.body);
            const { country, value } = req.body;
            const citys = City.getCitiesOfState(country, value);
            res.json({ citys });
            // res.render("/singUp",{citys})

        } catch (error) {
            console.log(error);
        }
    })
}

/*------------------------------------------------------------
Election handel
-------------------------------------------------------------*/

{
    router.post("/MakeElaction", async (req, res) => {
        console.log("req.body:", req.body);
        const { CandidateName, CandidateVotes, From_date, To_date, election_name, selectedVoter } = req.body;
        const selectedRows = req.body.selectedVoter;
        const Voters = Array.isArray(selectedRows) ? selectedRows : [selectedRows];
        console.log("Voters:", Voters);
        if (typeof CandidateName == "string") {
            var Candidate_Name = [req.body.CandidateName]
            var Candidate_Votes = [req.body.CandidateVotes]
            console.log("if", CandidateName);
        } else {
            var Candidate_Name = [...req.body.CandidateName]
            var Candidate_Votes = [...req.body.CandidateVotes]
            console.log("else", CandidateName);
        }
        const newCandidateName = Candidate_Name.map((value) => {
            return value = {
                Candidate_Name: value,
            }
        })
        Candidate_Votes.forEach((value, i) => {
            newCandidateName[i].Candidate_Votes = value
        });

        console.log("newCandidateName:", newCandidateName);
        const Elections = new Election({ Partys: newCandidateName, From_date: From_date, To_date: To_date, election_name: election_name, Voters: Voters })
        await Elections.save();


        res.redirect("/CreateElaction")

    })

    router.get("/CreateElaction", async (req, res) => {
        const VoterDetail = await VoterDetails.find({})
        const CandidateDetail = await CandidateDetails.find({})
        const Elections = await Election.find({})
        res.render("CreateElaction", { CandidateDetail, VoterDetail, Elections })
    })
    router.delete("/Election/delete/:id", async (req, res) => {
        try {
            await Election.findByIdAndDelete(req.params.id)
        } catch {
            res.send({ succsess: false, massage: "Somthing is wrong" })
        }
    })

    router.post("/MakeElaction/ajax", async (req, res) => {
        try {
            const { MakeElaction } = req.body
            console.log(req.body);
            const Candidate = await CandidateDetails.find({ _id: MakeElaction });
            const CandidateDetail = Candidate[0]
            console.log(Candidate[0]);
            const Aumount = 0
            res.json({ CandidateDetail, Aumount })
            // console.log(Dates);
        } catch (error) {
            console.log(error);
        }
    })
}

/*------------------------------------------------------------
Face Identification
-------------------------------------------------------------*/
router.get("/FaceSacan", checkUserAuth, async (req, res) => {
    try {
        console.log("req.user:", req.user);
        const VoterDetaillls = req.user
        console.log("VoterDetaillls.id:--------", VoterDetaillls.id);
        const stages = await Stages.find({ Voter: VoterDetaillls.id })
        const stageNumber = stages[0].stageNumber
        console.log("stageNumber:", stageNumber);
        if (stageNumber === 1) {
            const Voter = await VoterDetails.find({})
            VoterDetail = Voter[0].image
            console.log("VoterDetail:", VoterDetail);
            await Stages.findOneAndUpdate({Voter:VoterDetaillls.id}, { stageNumber: 2 })
            res.render("FaceIdentification", { VoterDetail })
        } else {
            res.json({ "msg": "please complate first stage of otp verification" })
        }
    } catch (error) {
        console.log(error);
    }

})


/*------------------------------------------------------------
voting page propertys
-------------------------------------------------------------*/
router.get("/VotingNews", checkUserAuth, async (req, res) => {
    try {
        res.render("News")
    } catch (error) {
        console.log(error);
    }

})

//chat app
router.get("/ChatApp", async (req, res) => {
    try {
        res.render("ChatApp")
    } catch (e) {
        console.log(ChatApp);
    }
})
//===========export router=============
module.exports = router;