const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;

const isAuthenticated = require("../middlewares/isAuthenticated");
const Offer = require("../models/Offer");

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    // console.log(req.user);
    // console.log(req.files);
    // console.log(req.fields);
    // console.log(req.user);
    // console.log(req.files.picture.path);

    const { title, description, price, condition, city, brand, size, color } =
      req.fields;

    // const productDetail = [
    //   { MARQUE: brand },
    //   { TAILLE: size },
    //   { ÉTAT: condition },
    //   { COULEUR: color },
    //   { EMPLACEMENT: city },
    // ];
    // Créer un nouvel élément de collection/sans product_image
    const newOffer = new Offer({
      product_name: title,
      product_description: description,
      product_price: price,
      product_details: [
        { MARQUE: brand },
        { TAILLE: size },
        { ÉTAT: condition },
        { COULEUR: color },
        { EMPLACEMENT: city },
      ],
      owner: req.user,
      //{ account: req.user.account, _id: req.user._id },
      // product_image: result,
    });
    console.log(newOffer);
    // console.log(newOffert); // permet d'avoir l'id de l'offre
    // console.log(newOffert._id);ça marche !!!
    // J'upload l'image sur cloudinary//en rajoutant l'id de l'offre comme dossier
    const result = await cloudinary.uploader.upload(req.files.picture.path, {
      folder: `/vinted/offers/${newOffer._id}`,
    });

    // permet de rajouter à l'offre l'objet result(contenant les infos sur la photo)
    newOffer.product_image = result;
    await newOffer.save(); // permet de sauvegarder l'offre modifier
    // console.log(newOffer);
    res.json("Image uploaded");
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

router.put("/offer/change", isAuthenticated, async (req, res) => {
  //route pour modifier les annonces après être autentifié par le token => middleware
  try {
    const {
      id,
      title,
      description,
      price,
      condition,
      city,
      brand,
      size,
      color,
    } = req.fields;
    // console.log(id);
    // console.log(title);
    // console.log(description);
    // console.log(price);
    // console.log(condition);
    // console.log(city);
    // console.log(brand);
    // console.log(size);
    // console.log(color);
    // console.log(req.fields);

    const findOffer = await Offer.findById({ _id: id }); //

    if (findOffer) {
      // si les diverses variables existent ou pas je modifie l'offre en fonction
      if (title) {
        findOffer.product_name = title;
        await findOffer.save();
      }
      if (description) {
        findOffer.product_description = description;
        await findOffer.save();
      }
      if (price) {
        findOffer.product_price = price;
        await findOffer.save();
      }
      if (condition) {
        findOffer.product_details[2] = { ÉTAT: [condition] };

        await findOffer.save();
      }
      if (city) {
        findOffer.product_details[4] = { EMPLACEMENT: [city] };
        await findOffer.save();
      }
      if (size) {
        findOffer.product_details[1] = { TAILLE: [size] };
        await findOffer.save();
      }
      if (color) {
        findOffer.product_details[3] = { COULEUR: [color] };
        await findOffer.save();
      }
      if (brand) {
        findOffer.product_details[0] = { MARQUE: [brand] };
        await findOffer.save();
      }

      res.json({
        message: "the modifications are done",
      });
    } else {
      res.status(400).json({
        message: "this offer doesn't exist",
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/offer/delete", isAuthenticated, async (req, res) => {
  try {
    const findOfferById = await Offer.findById({ _id: req.fields.id });
    console.log(findOfferById);
    const folder = findOfferById.product_image.public_id;
    // console.log(folder); chemin jusqu'à l'image de cloudinary
    // supprimer la photo correspondant à l'offre dans le dossier vinted-publish cloundinary
    await cloudinary.api.delete_resources_by_prefix(`${folder}`);
    // supprimer l'offre concernée
    await Offer.deleteOne(findOfferById);
    res.json({ message: "the offer is deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//Ma version qui impose un prix max ou min si rien n'est resnseignée.....
// router.get("/offers", async (req, res) => {
//   // console.log("bien dans /offers");
//   try {
//     // console.log(req.query);
//     const { title, priceMin, priceMax, sort, page } = req.query;
//     // console.log(title);    // console.log(priceMin);    // console.log(priceMax);    // console.log(sort);    // console.log(page);
//     let prixMin;
//     let prixMax;
//     if (!priceMin) {
//       // s'il n'y a pas de prix indiqué j'attribue un prix min// qui correspond au model Offer
//       prixMin = 0;
//     } else {
//       prixMin = priceMin;
//     }
//     if (!priceMax) {
//       // j'attribue un prix max pour les offres en cas d'absence de prix qui correspond au model Offer
//       prixMax = 10000;
//     } else {
//       prixMax = priceMax;
//     }
//     // count permet de connaitre le nombre d'offres en fonction des infos reçus en params
//     const count = await Offer.find({
//       product_name: new RegExp(title, "i"),
//       product_price: {
//         $gte: prixMin,
//         $lte: prixMax,
//       },
//     }).countDocuments();

//     // console.log(count); count the number of offers finded

//     // console.log(sort);
//     let filterPrice;
//     if (sort) {
//       if (sort === "price-desc") {
//         filterPrice = -1;
//       }
//       if (sort === "price-asc") {
//         filterPrice = 1;
//       }
//     } else {
//       // console.log("le filtre par défaut est asc"); // si sort n'est pas indiqué ou mal renseigné
//       filterPrice = 1;

//       // console.log(filterPrice);
//     }
//     const pageInNumber = Number(page); // transforme la value de page en number
//     const limit = 3; // variable qui permet d'afficher le nombre d'annonce par page

//     if (!pageInNumber || pageInNumber === 0 || pageInNumber === 1) {
//       const offers = await Offer.find({
//         product_name: new RegExp(title, "i"),
//         product_price: {
//           $gte: prixMin, //mettre Number au cas où ce soit une string reçu
//           $lte: prixMax, //idem
//         },
//       })
//         .sort({ product_price: filterPrice })
//         .skip(0)
//         .limit(limit)
//         .select("product_name product_price");
//       // .populate("owner", "account"); //permet  de populate que owner.account
//       // console.log(offerFind0[0].product_details);

//       res.json({
//         count,
//         offers,
//       });
//     } else {
//       const offers = await Offer.find({
//         product_name: new RegExp(title, "i"),
//         product_price: {
//           $gte: prixMin,
//           $lte: prixMax,
//         },
//       })
//         .sort({ product_price: filterPrice })
//         .skip((pageInNumber - 1) * limit)
//         .limit(limit)
//         .populate("owner", "account")
//         .select(
//           "product_details _id product_name product_description product_price owner product_image.secure_url __v"
//         );

//       res.json({ count, offers });
//     }
//   } catch (error) {
//     res.status(400).json({
//       message: error.message,
//     });
//   }
// });

// test pour apprendre à utiliser switch ////////
// switch (pageInNumber) {
//   case 0: // si la page n'est pas renseigné même résultat que la page 1
//     const offerFind0 = await Offer.find({
//       product_name: new RegExp(title, "i"),
//       product_price: {
//         $gte: prixMin,
//         $lte: prixMax,
//       },
//     })
//       .sort({ product_price: filterPrice })
//       .skip(0)
//       .limit(3)
//       .select("product_name product_price");
//     // .populate("owner", "account"); //permet  de populate que owner.account
//     // console.log(offerFind0[0].product_details);

//     res.json({
//       count,
//       offerFind0,
//     });
//     break;

//   case 1:
//     const offerFind1 = await Offer.find({
//       product_name: new RegExp(title, "i"),
//       product_price: {
//         $gte: prixMin,
//         $lte: prixMax,
//       },
//     })
//       .sort({ product_price: filterPrice })
//       .skip(0)
//       .limit(3)
//       .populate("owner", "account"); //permet  de populate que owner.account

//     res.json({
//       count,
//       offerFind1,
//     });
//     break;

//   case 2:
//     const offerFind2 = await Offer.find({
//       product_name: new RegExp(title),
//       product_price: {
//         $gte: prixMin,
//         $lte: prixMax,
//       },
//     })
//       .sort({ product_price: filterPrice })
//       .skip(3)
//       .limit(3)
//       .populate("owner", "account");
//     res.json({ count, offerFind2 });
//     break;

//   case 3:
//     const offerFind3 = await Offer.find({
//       product_name: new RegExp(title, "i"),
//       product_price: {
//         $gte: prixMin,
//         $lte: prixMax,
//       },
//     })
//       .sort({ product_price: filterPrice })
//       .skip(6)
//       .limit(3)
//       .populate("owner", "account");
//     res.json(offerFind3);
//     break;

//   case 4:
//     const offerFind4 = await Offer.find({
//       product_name: new RegExp(title, "i"),
//       product_price: {
//         $gte: prixMin,
//         $lte: prixMax,
//       },
//     })
//       .sort({ product_price: filterPrice })
//       .skip(9)
//       .limit(3)
//       .populate("owner", "account");
//     res.json(offerFind4);
//     break;

//   default:
//     res.json("il va falloir créer des pages supplémentaires 😁");
//     break;
// }

///// version de la correction de TOM /// ci-dessous que je vais utiliser pour le déploiement//////

router.get("/offers", async (req, res) => {
  try {
    const filters = {};
    // Alimenter mon filter en fonction des queries que je reçois
    if (req.query.title) {
      // Ajouter une clef product_name à mon objet qui contiendra un RegExp
      filters.product_name = new RegExp(req.query.title, "i");
    }

    // const regexp = new RegExp(undefined);
    // const str = "salut";
    // console.log(regexp.test(str));

    // const obj = {
    //   product_name: /bleu/,
    //   product_price: { $lte: 100 },
    // };

    if (req.query.priceMin) {
      // console.log(typeof req.query.priceMin);
      filters.product_price = { $gte: Number(req.query.priceMin) };
    }

    if (req.query.priceMax) {
      // Si j'ai déjà une clef product_price, alors je rajoute une clef $lte à l'objet contenu dans product_price
      if (filters.product_price) {
        filters.product_price.$lte = Number(req.query.priceMax);
      } else {
        // Si non, je rajoute une clef product_price à filters qui contiendra { $lte: Number(req.query.priceMax) }
        filters.product_price = { $lte: Number(req.query.priceMax) };
      }
    }

    const sort = {};

    if (req.query.sort === "price-desc") {
      sort.product_price = "desc";
    } else if (req.query.sort === "price-asc") {
      sort.product_price = "asc";
    }

    let limit = 3;
    if (req.query.limit) {
      limit = req.query.limit;
    }

    let page = 1;
    if (req.query.page) {
      page = req.query.page;
    }
    const skip = (page - 1) * limit;

    // 10 résultats par page : 1 skip 0, 2 skip 10, 3 skip 20
    // 3 //                   : 1 skip 0, 2 skip 3, 3 skip 6

    const results = await Offer.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("owner", "_id account");
    const count = await Offer.countDocuments(filters);

    // console.log(results.length);
    res.json({ count: count, offers: results });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    // console.log(req.params);
    const offerFind = await Offer.findById(req.params.id)
      .populate("owner", "account")
      .select(
        "product_details _id product_name product_description product_price owner product_image.secure_url __v"
      );
    if (offerFind) {
      res.json(offerFind);
    }
  } catch (error) {
    res.status(400).json({
      response: { problem: "Offer not found", message: error.message },
      // message: error.message,
    });
  }
});

module.exports = router;
