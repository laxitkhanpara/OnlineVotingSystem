const mongoose = require('mongoose');

//=============AddVoter==================================================
const VoterDetail = new mongoose.Schema(
    {
        FirstName: {
            type: String,
            required: true,
            index: true,
        },
        LastName: {
            type: String,
            required: true,
            index: true,
        },
        VoterId: {
            type: String,
            required: true,
            index: true,
            unique: true,
        },
        mobile: {
            type: String,
            required: true,
            index: true,
        },
        Country: {
            type: String,
            required: true,
            index: true,
        },
        State: {
            type: String,
            required: true,
            index: true,
        },
        City: {
            type: String,
            required: true,
            index: true,
        },
        Street: {
            type: String,
            required: true,
            index: true,
        },
        zipCode: {
            type: String,
            required: true,
            index: true,
        },
        image: {
            type: String,
            required: true,
            index: true,
        },
        DateofCreate: {
            type: Date,
            default: Date.now
        }
    }
)
const VoterDetails = new mongoose.model('VoterDetails', VoterDetail);

//=============AddCandidate==================================================

const CandidateDetail = new mongoose.Schema(
    {
        FirstName: {
            type: String,
            required: true,
            index: true,
        },
        LastName: {
            type: String,
            required: true,
            index: true,
        },
        PartyName: {
            type: String,
            required: true,
            index: true,
        },
        CandidateId: {
            type: String,
            required: true,
            index: true,
            unique: true,
        },
        mobile: {
            type: String,
            required: true,
            index: true,
        },
        Country: {
            type: String,
            required: true,
            index: true,
        },
        State: {
            type: String,
            required: true,
            index: true,
        },
        City: {
            type: String,
            required: true,
            index: true,
        },
        Street: {
            type: String,
            required: true,
            index: true,
        },
        zipCode: {
            type: String,
            required: true,
            index: true,
        },
        image: {
            type: String,
            required: true,
            index: true,
        },
        Symbol: {
            type: String,
            required: true,
            index: true,
        },
        Sins: {
            type: String,
            required: true,
            index: true,
        },
        About: {
            type: String,
            required: true,
            index: true,
        },
        DateofCreate: {
            type: Date,
            default: Date.now
        }
    }
)
const CandidateDetails = new mongoose.model('CandidateDetails', CandidateDetail);

//=============Election==================================================
const NewElection = new mongoose.Schema(
    {
        election_name: {
            type: String,
            required: true,
            unique: true
        },
        From_date: {
            type: Date,
            required: true,
        },
        To_date: {
            type: Date,
            required: true,
        },
        Partys: [
            {
                Candidate_Name: {
                    type: String,
                    required: true,

                },
                Candidate_Votes: {
                    type: Number,
                    required: true,
                }
            }
        ],
        Voters: [

        ]
    }
)
const Election = new mongoose.model('Election', NewElection);

const Stage = new mongoose.Schema(
    {
        Voter: {
            type: String,
            default:0
        },
        stageNumber: {
            type: Number,
            default:0
        },
        Election: [
            {
                electionname: {
                    type: String
                }
            }
        ]
    }
)
const Stages = new mongoose.model('Stages', Stage);

/*=============Export the model==============*/

module.exports = { VoterDetails, CandidateDetails, Election,Stages }