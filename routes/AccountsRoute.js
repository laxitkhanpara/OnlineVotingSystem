const express = require('express')
const app = express();
const router = express.Router();
const bcrypt = require('bcrypt');
const changeCase = require('change-case');
// const { checkUserAuth } = require("../middleware/authMiddleware");
const { genrateTocken } = require('../middleware/jwtToken');
const { SignUp } = require("../models/AccountsSchema")


router.get("/", async (req, res) => {
    try {
        console.log("Page loaded");
        res.render("LandingPage")
    } catch (error) {
        console.log(error);
    }
})
router.get("/lol", async (req, res) => {
    try {
        console.log("Page loaded");
        res.render("FaceIdentification")
    } catch (error) {
        console.log(error);
    }
})


/*------------------------------------------------------------------------------------------------------------------------
    logIn/logOut
---------------------------------------------------------------------------------------------------------------------*/
{
    router.get("/LogIn", async (req, res) => {
        try {
            const token = req.cookies.LogIn;
            console.log("token:----", token)
            res.render("LogIn");
        } catch (error) {
            console.log(error);
        }
    })

    router.post("/LogIn", async (req, res) => {
        try {
            console.log("login start");
            const { Email, Password } = req.body;
            console.log(req.body);
            const findUser = await SignUp.find({ Email });
            console.log(findUser);
            if (!findUser) {
                res.json({
                    msg: "please registor"
                })
            } else {
                const hash = await bcrypt.compare(Password, findUser[0].Password);
                console.log(hash);
                if (hash === true) {
                    //genrate the tocken and store in cookie
                    const token = genrateTocken(findUser.id);
                    res.cookie('LogIn', token, process.env.JWT_SECRET, {
                        expires: new Date(Date.now() + 50000),
                        httpOnly: true,
                    })
                    res.redirect("/")
                } else {
                    res.json({
                        msg: "Email or Password may be wrong",
                    })
                }
            }
            console.log(123);
            // res.render("Role", { Role })
        } catch (error) {
            console.log(error);
        }
    })
    //=========logOut=====================
    router.get('/logOut', async (req, res) => {
        try {
            res.clearCookie("signIn");
            console.log("logout successfully");
            await req.user.save();
            res.rendar("signIn")
        } catch (error) {
            res.status(500).send(error)
        }
    })
}

/*------------------------------------------------------------------------------------------------------------------------
    SignUp
---------------------------------------------------------------------------------------------------------------------*/
{
    router.get("/SignUp", async (req, res) => {
        try {
            res.render("SignUp");
        } catch (error) {
            console.log(error);
        }
    })

    router.post("/SignUp", async (req, res) => {
        try {
            console.log("SignUp:", req.body);
            const { FirstName, LastName, Email, Password } = req.body
            // const Fname=changeCase.pascalCase(FirstName)
            // const Lname=changeCase.pascalCase(LastName)
            const hash = await bcrypt.hash(Password, 10);
            const newdepartment = new SignUp({ FirstName: changeCase.pascalCase(FirstName), LastName: changeCase.pascalCase(LastName), Email, Password: hash })
            newdepartment.save();
            res.redirect("/LogIn")
        } catch (error) {
            console.log(error);
        }
    })
}
/*------------------------------------------------------------------------------------------------------------------------
    Account
---------------------------------------------------------------------------------------------------------------------*/
{
    router.get("/Account", async (req, res) => {
        try {
            res.render("Account");
        } catch (error) {
            console.log(error);
        }
    })

    router.post("/Account", async (req, res) => {
        try {
            console.log("SignUp:", req.body);
            const { FirstName, LastName, Email, Password } = req.body
            // const Fname=changeCase.pascalCase(FirstName)
            // const Lname=changeCase.pascalCase(LastName)
            const hash = await bcrypt.hash(Password, 10);
            const newdepartment = new SignUp({ FirstName: changeCase.pascalCase(FirstName), LastName: changeCase.pascalCase(LastName), Email, Password: hash })
            newdepartment.save();
            res.redirect("/LogIn")
        } catch (error) {
            console.log(error);
        }
    })
}


//===========export router=============
module.exports = router;