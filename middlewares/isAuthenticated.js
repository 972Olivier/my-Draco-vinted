const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  //si le token existe à rajouter avec try catch
  try {
    if (req.headers.authorization) {
      // console.log("On rentre dans le middleware");
      const token = req.headers.authorization.replace("Bearer ", "");
      //   Chercher dans ma BDD si un user a bien ce token et on selection ses key account et _id
      const userFind = await User.findOne({ token: token }).select(
        "account _id"
      );
      // console.log(userFind);

      if (userFind) {
        //   //   J'ai fait une requête à ma BDD et j'ai des infos concernant le user que j'ai trouvé, je stocke ces informations dans req, comme ça je pourrai y avoir accès dans le reste de ma route
        req.user = userFind;
        next();
        //   // Je passe à la suite de ma route
      } else {
        res.status(401).json({ message: "Unauthorized" });
      }
    } else {
      res.status(401).json({ message: "Unauthorized " });
    }
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

module.exports = isAuthenticated;
