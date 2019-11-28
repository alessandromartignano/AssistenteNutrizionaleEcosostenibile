var mongoose = require('mongoose');
var Meal = mongoose.model('Meals');


/**
 * Loads all the meals for a given user
 */
exports.load_meals_list = async (req, res) => {
	console.log("looking for meal...") //DEBUG

	var query = req.query;

	await Meal.findOne(query)
	.exec()
	.then((doc) => {
		if(doc.length == 0){
			res.status(404).send({description: 'Meals not found for user '+ req.query.username});
			console.log('Meals not found for user '+ req.query.username); //DEBUG
		}else{
			res.status(200).json(doc);
			console.log('Meals list for user '+ req.query.username+":\n"+doc); //DEBUG
		}	
	})
	.catch((err) => res.send(err));

};


/**
 * Loads a specific meal for a given user
 */
exports.load_meal = async (req, res) => {
	console.log("looking for meal to load...") //DEBUG

	var query = { 'username' : req.query.username };
	var projection = { 'username' : req.query.username, 'meals' : { $elemMatch: { 'meal_name': req.query.mealName }}}

	await Meal.findOne(query, projection)
	.exec()
	.then((doc) => {
		if(doc.length == 0){
			res.status(404).send({description: 'Meal not found for user '+ req.query.username});
			console.log('Meal not found for user '+ req.query.username); //DEBUG
		}else{
			res.status(200).json(doc);
			console.log('Meal found for user '+ req.query.username+":\n"+doc); //DEBUG
		}	
	})
	.catch((err) => res.send(err));
};


/**
 * Inserts a new meal for a given user
 */
exports.new_meal = async (req, res) => {
	var query = {'username': req.body.username};

	await Meal.findOne(query)
	.exec()
	.then((doc) => {
		if(doc == null){
			create_first_meal(req, res);
			console.log('Meal not found for user '+ req.query.username+"\n Inserting..."); //DEBUG
		}else{
			add_meal(req, doc, res);
			console.log('Meal found for user '+ req.query.username+":\n"+doc); //DEBUG
		}	
	})
	.catch((err) => res.send(err));
};

/**
 * Creates the first meal of a user
 * @param {*} req request received
 * @param {*} res response to send
 */
 create_first_meal = (req, res) => {
	var new_meal = new Meal(req.body);
	new_meal.save(function(err, meal) { 
		if (err){
			console.log("Error while creating new meal"); //DEBUG
			res.send(err);
		} 
		console.log("Meal created" + meal);	//DEBUG
		res.status(201).json(meal);
	});	
}

/**
 * Adds meals to a user's meals list
 * @param {*} req request received
 * @param {*} doc document of the user
 * @param {*} res response to send
 */
add_meal = (req, doc, res) => {

	//TODO: GESTIONE RES, CONTROLLO SE ESISTE GIà UN update_meal CON LO STESSO NOME (OPPURE usare un id per evitarlo)
	var meal_to_add = req.body.meals; 
	
	var update_meal = new Meal(doc);
	update_meal.meals.push(meal_to_add);

	update_meal.save(function(err, meal){
		if (err){
			console.log("error while updating new meal"); //DEBUG
			res.send(err);
		} 
		console.log("meal updated -> "+meal);	//DEBUG
		res.status(201).json(meal);
	});	
}

/**
 * Creates a component for an existing meal
 */
exports.new_component = async (req, res) => {

	var query = { 'username' : req.body.username };
	 
	await Meal.find(query)
	.exec()
    .then((doc) => {
		if(doc == null) 
			res.status(404).send({description: 'Meals not found for user '+ req.body.username});
		else{
			console.log("doc"+doc)
			doc[0].meals.forEach(d => {
				if(d.meal_name === req.body.mealName)
					d.components.push(req.body.components);
			});	
			doc[0].save((err) => { if (err) res.send(err); });
			res.status(201).json(doc);
		}
		
		//TODO: update e calcolo delle calorie tot e degli altri valori totali
    })
    .catch((err) => res.send(err));
}


