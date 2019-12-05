/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');

const Meal = mongoose.model('Meals');
const Products = mongoose.model('Product');

/**
 * Given a value for 100 grams, computes value for a given quantity.
 * @param {*} value for 100g of the product
 * @param {*} quantity portion of the product in grams
 */
const computeValuePerPortion = (value, quantity) => ((value / 100) * quantity);

const valuePerPortion = (value, quantity) => {
  let valuePerQuantity;

  if (value != null) valuePerQuantity = computeValuePerPortion(value, quantity);
  else valuePerQuantity = 0;

  return valuePerQuantity;
};


/**
 * Computes meal's values given its components
 * @param {*} barcodes of the products that compose the meal
 * @param {*} quantities in grams of the products eaten
 * @param {*} res
 */
const computeMealValues = async (barcode, quantity, res) => {
  let productName;
  let imageUrl;
  let energyTot;
  let carbsTot;
  let sugarsTot;
  let fatTot;
  let saturatedFatTot;
  let proteinsTot;
  let fiberTot;
  let saltTot;
  let sodiumTot;
  let alcoholTot;
  let calciumTot;
  let carbonFootprintTot;
  let waterFootprintTot;

  const query = { code: barcode };
  console.log(JSON.stringify(query));

  await Products.findOne(query)
    .exec()
    .then((product) => {
      console.log(`product--${JSON.stringify(product.energy_100g)}`); // DEBUG

      productName = product.product_name;
      imageUrl = product.image_url;
      energyTot = valuePerPortion(product.energy_100g, quantity);
      carbsTot = valuePerPortion(product.carbohydrates_100g, quantity);
      sugarsTot = valuePerPortion(product.sugars_100g, quantity);
      fatTot = valuePerPortion(product.fat_100g, quantity);
      saturatedFatTot = valuePerPortion(product.saturated_fat_100g, quantity);
      proteinsTot = valuePerPortion(product.proteins_100g, quantity);
      fiberTot = valuePerPortion(product.fiber_100g, quantity);
      saltTot = valuePerPortion(product.salt_100g, quantity);
      sodiumTot = valuePerPortion(product.sodium_100g, quantity);
      alcoholTot = valuePerPortion(product.alcohol_100g, quantity);
      calciumTot = valuePerPortion(product.calcium_100g, quantity);
      carbonFootprintTot = valuePerPortion(product.carbon_footprint_100g, quantity);
      waterFootprintTot = valuePerPortion(product.water_footprint_100g, quantity);

      console.log(`product energy--${JSON.stringify(energyTot)}`); // DEBUG
    })
    .catch((err) => res.send(err));

  const values = {
    product_name: productName,
    image_url: imageUrl,
    energy_tot: energyTot,
    carbohidrates_tot: carbsTot,
    sugars_tot: sugarsTot,
    fat_tot: fatTot,
    saturated_fat_tot: saturatedFatTot,
    proteins_tot: proteinsTot,
    salt_tot: saltTot,
    sodium_tot: sodiumTot,
    calcium_tot: calciumTot,
    alcohol_tot: alcoholTot,
    fiber_tot: fiberTot,
    carbon_footprint_tot: carbonFootprintTot,
    water_footprint_tot: waterFootprintTot,
  };
  console.log(`VALUES${JSON.stringify(values)}`); // DEBUG

  return values;
};

/**
 * Update meals total values
 * @param {*} req
 * @param {*} energyTot
 */
const updateMealValues = async (components, mealName, userMeals, res) => {
  const { barcode } = components;
  const { quantity } = components;

  computeMealValues(barcode, quantity, res)
    .then((values) => {
      userMeals.meals.forEach((meal) => {
        if (meal.meal_name === mealName) {
          // Meal schema field update
          meal.energy_tot += values.energy_tot;
          meal.carbohidrates_tot += values.carbohidrates_tot;
          meal.sugars_tot += values.sugars_tot;
          meal.fat_tot += values.fat_tot;
          meal.saturated_fat_tot += values.saturated_fat_tot;
          meal.proteins_tot += values.proteins_tot;
          meal.salt_tot += values.salt_tot;
          meal.sodium_tot += values.sodium_tot;
          meal.calcium_tot += values.calcium_tot;
          meal.alcohol_tot += values.alcohol_tot;
          meal.fiber_tot += values.fiber_tot;
          meal.carbon_footprint_tot += values.carbon_footprint_tot;
          meal.water_footprint_tot += values.water_footprint_tot;

          // Components schema field update
          components.product_name = values.product_name;
          components.image_url = values.image_url;

          console.log(`components: ${components}`); // DEBUG

          meal.components.push(components);
        }
      });
      userMeals.save((err) => { if (err) res.send(err); });
    });
};


/**
 * Loads all the meals for a given user
 */
exports.load_meals_list = async (req, res) => {
  console.log('looking for meal...'); // DEBUG

  const { query } = req;

  await Meal.findOne(query)
    .exec()
    .then((doc) => {
      if (doc.length === 0) {
        res.status(404).send({ description: `Meals not found for user ${req.query.username}` });
        console.log(`Meals not found for user ${req.query.username}`); // DEBUG
      } else {
        res.status(200).json(doc);
        console.log(`Meals list for user ${req.query.username}:\n${doc}`); // DEBUG
      }
    })
    .catch((err) => res.send(err));
};


/**
 * Loads a specific meal for a given user
 */
exports.load_meal = async (req, res) => {
  console.log('looking for meal to load...'); // DEBUG

  const query = { username: req.query.username };
  const projection = {
    username: req.query.username,
    meals: { $elemMatch: { meal_name: req.query.mealName } },
  };

  await Meal.findOne(query, projection)
    .exec()
    .then((doc) => {
      if (doc.length === 0) {
        res.status(404).send({ description: `Meal not found for user ${req.query.username}` });
        console.log(`Meal not found for user ${req.query.username}`); // DEBUG
      } else {
        res.status(200).json(doc);
        console.log(`Meal found for user ${req.query.username}:\n${doc}`); // DEBUG
      }
    })
    .catch((err) => res.send(err));
};

/**
 * Creates the first meal of a user
 * @param {*} req request received
 * @param {*} res response to send
 */
const createFirstMeal = (req, res) => {
  // creo un pasto vuoto con solo username e meal name

  console.log(JSON.stringify(req.body));
  const newMeal = new Meal(req.body);

  // provare con newMeal.meals[0].energyTot
  newMeal.meals[0].components = [{}];
  newMeal.meals[0].energy_tot = 0;
  newMeal.meals[0].carbohydrates_tot = 0;
  newMeal.meals[0].sugars_tot = 0;
  newMeal.meals[0].fat_tot = 0;
  newMeal.meals[0].saturated_fat_tot = 0;
  newMeal.meals[0].proteins_tot = 0;
  newMeal.meals[0].fiber_tot = 0;
  newMeal.meals[0].salt_tot = 0;
  newMeal.meals[0].sodium_tot = 0;
  newMeal.meals[0].alcohol_tot = 0;
  newMeal.meals[0].calcium_tot = 0;
  newMeal.meals[0].carbon_footprint_tot = 0;
  newMeal.meals[0].water_footprint_tot = 0;
  newMeal.meals[0].timestamp = new Date();

  console.log(`new meal${newMeal}`);
  console.log(`meals${newMeal.meals}`);
  console.log(`meal 0 ${newMeal.meals[0]}`);
  console.log(`meal 0 component ${newMeal.meals[0].components}`);
  console.log(`meal 0 timestamp ${newMeal.meals[0].timestamp}`);

  newMeal.save()
    .then((meal) => {
      console.log(`meal created -> ${meal}`); // DEBUG
      res.status(201).json(meal);
    })
    .catch((err) => {
      console.log('error while creating new meal'); // DEBUG
      res.send(err);
    });
};

/**
 * Adds meals to a user's meals list
 * @param {*} req request received
 * @param {*} doc document of the user
 * @param {*} res response to send
 */
const addMeal = (req, doc, res) => {
  // TODO: GESTIONE RES, CONTROLLO SE ESISTE GIà UN update_meal
  //  CON LO STESSO NOME (OPPURE usare un id per evitarlo)
  const mealToAdd = req.body.meals;

  const updateMeal = new Meal(doc);
  updateMeal.meals.push(mealToAdd);

  updateMeal.save()
    .then((meal) => {
      console.log(`meal updated -> ${meal}`); // DEBUG
      res.status(201).json(meal);
    })
    .catch((err) => {
      console.log('error while updating new meal'); // DEBUG
      res.send(err);
    });
};

/**
 * Inserts a new meal for a given user
 */
exports.new_meal = async (req, res) => {
  const query = { username: req.body.username };

  await Meal.findOne(query)
    .exec()
    .then((doc) => {
      if (doc == null) {
        createFirstMeal(req, res);
        console.log(`Meal not found for user ${req.query.username}\n Inserting...`); // DEBUG
      } else {
        addMeal(req, doc, res);
        console.log(`Meal found for user ${req.query.username}:\n${doc}`); // DEBUG
      }
    })
    .catch((err) => res.send(err));
};


/**
 * Creates a component for an existing meal
 */
exports.new_component = async (req, res) => {
  const query = { username: req.body.username };
  const { mealName } = req.body;
  const { components } = req.body;
  console.log(`NEW COMPONENT\nmealName${JSON.stringify(mealName)}\ncomponents${JSON.stringify(components)}`); // DEBUG

  await Meal.find(query)
    .exec()
    .then((userMeals) => {
      if (userMeals == null) {
        res.status(404).send({ description: `Meal not found for user ${req.query.username}` });
      } else {
        console.log(`userMeals${userMeals[0]}`); // DEBUG
        updateMealValues(components, mealName, userMeals[0], res);
      }
    })
    .catch((err) => res.send(err));
};
