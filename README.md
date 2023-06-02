santa_with_db


Modified the five RESTful routes for categories, and made them query the database instead of using the categories variable.



one to get the list of all elements (GET)
one to show one specific element (GET)
one to create a new element (POST)
one to update an element (PUT)
one to delete an element (DELETE)
If a requested category doesn't exist, return a 404. (This never changes, it's part of the HTTP protocol!)
