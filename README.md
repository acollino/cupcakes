# Cupcakes
A cupcake menu with a JSON API that allows adding/deleting/editing without page refreshes.

## Usage and Code Information
Cupcakes are stored in a corresponding table in the desserts database, recording their flavor, size, rating, and photo url.

The cupcakes are displayed on the home page, and hovering over their images will bring up buttons to allow editing or deleting the cupcake.
The home page also contains an Add New Cupcake form; this will add the new cake both to the database and the home page.

Information is stored in a server-side database using PostgreSQL, accessed via Flask-Sqlalchemy. The page makes use of a JSON API with a RESTful format - a single endpoint that will process GET, POST, PATCH, and DELETE requests. Cupcakes are sent to and from the server as JSON, and the page's Javascript converts any received JSON into Cupcake objects stored in a CupcakeList and displays them on the page.

The app is hosted on Heroku and is available at https://acollino-cupcakes.herokuapp.com.

## Previews
<img src="https://user-images.githubusercontent.com/8853721/183539892-9b1a4126-eb48-44ef-b8c9-e4bac1856cdc.png" alt="Cupcakes home page" style="width: 700px">

<img src="https://user-images.githubusercontent.com/8853721/183539981-5abde704-ee04-4513-98e1-c60dd31aef11.png" alt="Cupcake edit form" style="height: 500px;">


## Attributions
**Page font:** [Varela Round, on Google Fonts](https://fonts.google.com/betterspecimen/Varela+Round)

**Title and Header font:** [Yanone Kaffeesatz, on Google Fonts](https://fonts.google.com/betterspecimen/Yanone+Kaffeesatz)

**Cupcake Icon:** [Created by by iconixar - Flaticon](https://www.flaticon.com/free-icons/cupcake)

**Background Banner:** [Love message vector created by freepik](https://www.freepik.com/vectors/love-message)

**Cupcake Images, from Pixabay:** [cookie dough cupcake](https://pixabay.com/photos/cupcakes-muffins-baking-2179039/), [chocolate cupcake](https://pixabay.com/photos/cupcakes-chocolate-muffin-food-5116009/), [hazelnut cupcake](https://pixabay.com/photos/cupcake-cake-sweets-sugar-104654/)
