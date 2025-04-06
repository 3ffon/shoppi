## TODO

### PRODUCT
- [x] should not change defaultValue on select control (item form)
- [x] should have only one FormItem (and not per item) (which is the cause for the next bug)
- [x] should close the "new category" section after form is submitted / cancelled

- [ ] when item updated on server - run the "on edit" animation
- [ ] think about other sorting methods for better user experience
- [ ] build the shopping cart view
- [ ] add "add to cart" functionality from the product list view
- [ ] add "remove from cart" functionality from the product list view

### SECTIONS
- [ ] complete the section form
- [ ] section view - support editing
- [ ] section view - support sort based on drag and drop (change order in api)

### SHOPPING CART
consider building shopping list, using the products db as a datasource, then display only the select items in the list
the flow should be:
- search for a product, then show a button "Add to cart"
- add a view for the shopping cart
- support add / edit / remove from cart