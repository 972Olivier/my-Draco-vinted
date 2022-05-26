// const Offer = require("../models/Offer");
// const express = require("express");
// const router = express.Router();
// const cloudinary = require("cloudinary").v2;
// const User = require("../models/User");
// const isAuthenticated = require("../middleware/isAuthenticated");

// // Connexion à mon compte cloudinary
// cloudinary.config({
//   cloud_name: "drbxuciil",
//   api_key: "514339872849157",
//   api_secret: "waW01PBRqojeU6feuI9RxI96EjY",
// });

// router.post("/offer/publish", isAuthenticated, async (req, res) => {
//   try {
//     // console.log(req.user);
//     // console.log(req.files);
//     // console.log(req.fields);
//     // console.log(req.user);
//     // console.log(req.files.picture.path);

//     // J'upload l'image sur cloudinary
//     const result = await cloudinary.uploader.upload(req.files.picture.path, {
//       // Je rajoute une option pour enregistrer l'image dans un dossier spécial
//       folder: "/vinted-publish",
//     });
//     // console.log(result);
//     const { title, description, price, condition, city, brand, size, color } =
//       req.fields;
//     // console.log(title);
//     // console.log(description);
//     // console.log(price);
//     // console.log(condition);
//     // console.log(city);
//     // console.log(brand);
//     // console.log(size);
//     // console.log(color);
//     const productDetail = [
//       { MARQUE: brand },
//       { TAILLE: size },
//       { ÉTAT: condition },
//       { COULEUR: color },
//       { EMPLACEMENT: city },
//     ];
//     // Créer un nouvel élément de collection
//     const newOffert = new Offer({
//       product_name: title,
//       product_description: description,
//       product_price: price,
//       product_details: productDetail,
//       owner: { account: req.user.account, _id: req.user._id },
//       // Enregistrer result dans la clef image de mon modèle/ product_image: result,==> renvoie toutes les infos images
//       product_image: result,
//     });

//     await newOffert.save();
//     // console.log(newOffert._id);ça marche
//     // console.log(req.user);
//     res.json("Image uploadée");
//   } catch (error) {
//     res.status(400).json({
//       message: error.message,
//     });
//   }
// });

// module.exports = router;
