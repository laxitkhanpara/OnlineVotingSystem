const express = require('express')
const app = express();
const router = express.Router();
const bcrypt = require('bcrypt');
var { Country, State, City } = require("country-state-city");
const multer = require('multer');
const { VoterDetails, CandidateDetails, Election, Stages } = require("../models/GiveVoteSchema")
const path = require("path")
const { json } = require('body-parser');
const { checkUserAuth } = require("../middleware/authMiddleware");
const { render } = require('ejs');
const { PricingV1VoiceVoiceCountryInstanceInboundCallPrices } = require('twilio/lib/rest/pricing/v1/voice/country');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log(111, file.originalname);
        cb(null, "./public/upload");
    },
    filename: (req, file, cb) => {
        console.log(file);
        // Generate unique filenames for each uploaded photo
        const uniqueFileName = Date.now() + "-" + Math.round(Math.random() * 1000) + path.extname(file.originalname);
        cb(null, uniqueFileName);
    }
});

const upload = multer({ storage: storage });

//votingDisplay
{
    router.get("/VotingDisplay", checkUserAuth, async (req, res) => {
        try {
            const Elections = await Election.find({})
            const CandidateDetail = await CandidateDetails.find({})
            res.render("VotingDisplay", { CandidateDetail, Elections })
        } catch (error) {
            console.log(error);
        }
    })
    router.get("/OptionsOfElection", checkUserAuth, async (req, res) => {
        try {
            const voter = req.user;
            const stages = await Stages.find({ Voter: voter.id })
            const stageNumber = stages[0].stageNumber
            console.log("stageNumber:", stageNumber);
            if (stageNumber === 2) {
                const Elections = await Election.find({})
                const CandidateDetail = await CandidateDetails.find({})

                res.render("OptionsOfElection", { CandidateDetail, Elections })

            } else {
                res.json({ "msg": "please first of all verify youer face and and verify by otp" })
            }
        } catch (error) {
            console.log(error);
        }
    })
    router.post("/SelectElection", checkUserAuth, async (req, res) => {
        try {
            const { selectedVoter } = req.body;
            const Voterid = req.user;
            const Elections = await Election.find({ _id: selectedVoter });
            const { Partys } = Elections[0]; // Access the Partys array from the first element

            (Elections[0].Voters).forEach(async function (element) {
                if (Voterid.id === element) {
                    console.log("element:", element);

                    const candidates = await CandidateDetails.aggregate([
                        {
                            $match: { PartyName: { $in: Partys.map(party => party.Candidate_Name) } }
                        }
                    ]);

                    const candidatess = Partys.map(party => {
                        const matchingCandidate = candidates.find(candidate => candidate.PartyName === party.Candidate_Name);
                        return {
                            ...party,
                            ...matchingCandidate
                        };
                    });
                    console.log("candidatess", candidatess);
                    await Stages.findOneAndUpdate({ voter: PricingV1VoiceVoiceCountryInstanceInboundCallPrices.id }, { stageNumber: 3 }, {
                        Election: [
                            {
                                electionname: selectedVoter
                            }
                        ]
                    })
                    res.render("VotingDisplay", { candidatess })
                }
            });
        } catch (error) {
            console.log(error);
        }
    });

    router.post("/VotSubmited", checkUserAuth, async (req, res) => {
        try {

            const { Vote, electionid } = req.body
            console.log("req.body:", req.body);
            console.log(Vote, electionid);
            Election.findOneAndUpdate(
                { _id: electionid, 'Partys.Candidate_Name': Vote },
                { $inc: { 'Partys.$.Candidate_Votes': 1 } },
            )
                .then(updatedElection => {
                    if (updatedElection) {
                        console.log('Candidate vote incremented:', updatedElection);
                    } else {
                        console.log('Election or candidate not found');
                    }
                    res.redirect("/Compationslip")
                })
                .catch(error => {
                    console.log('Error:', error);
                });
            await Stages.findOneAndUpdate({ voter: voter.id }, { stageNumber: 4 })
        } catch (e) {
            console.log(e);
        }

    })

}
router.get("/Compationslip", checkUserAuth, async (req, res) => {

    try {
        const data = req.user
        console.log("data:", data);
        const stages = await Stages.find({ Voter: data.id })
        const stageNumber = stages[0].stageNumber
        console.log("stageNumber:", stageNumber);
        if (stageNumber === 3) {
            Stages.findOneAndUpdate({ Voter: data.id }, { stageNumber: 0 })
            res.render("Compationslip", { data })
        } else {
            res.json({ "msg": "please first of all verify youer face and and verify by otp" })
        }
    } catch (e) {
        console.log(e);
    }
})

//CandidateSystem
{
    router.get("/Candidate", checkUserAuth, async (req, res) => {
        try {
            const countrys = Country.getAllCountries();
            const VoterDetail = await VoterDetails.find({})
            const CandidateDetail = await CandidateDetails.find({})
            res.render("AddCandidate", { countrys, VoterDetail, CandidateDetail })
        } catch (error) {
            console.log(error);
        }
    })

    router.post("/AddCandidate", upload.fields([
        { name: "image", maxCount: 1 },
        { name: "Symbol", maxCount: 1 }
    ]), async (req, res) => {
        const { FirstName, LastName, PartyName, CandidateId, mobile, Country, State, City, Street, zipCode, Sins, About } = req.body;
        const { image, Symbol } = req.files;

        if (!image || !Symbol) {
            // Handle error if one or both files are missing
            return res.status(400).send("Please upload both photos.");
        }
        const Cimage = image[0].filename;
        const CSymbol = Symbol[0].filename

        const newCanddate = new CandidateDetails({ FirstName, LastName, PartyName, CandidateId, mobile, Country, State, City, Street, zipCode, Sins, About, Symbol: CSymbol, image: Cimage })
        await newCanddate.save();
        res.send("Photos uploaded successfully!");
        res.redirect("/Candidate")
    });

    router.delete("/Candidate/delete/:id", async (req, res) => {
        try {
            await CandidateDetails.findByIdAndDelete(req.params.id)
        } catch {
            res.send({ succsess: false, massage: "Somthing is wrong" })
        }
    })
}

//===========export router=============
module.exports = router;