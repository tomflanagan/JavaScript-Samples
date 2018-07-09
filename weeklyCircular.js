function weeklyCircular(data) {
	this.data = data;
}

weeklyCircular.prototype.getCircular = function(index) {
	this.circular = this.data[index];
	this.saleItems = {}
	this.departments = [];
	this.index = index;

	return this.circular;
 }

weeklyCircular.prototype.setSaleItems = function(saleItems, date) {
	if (saleItems.length) {
		for (var i = 0; i < saleItems.length; i++) {
      this.createDepartment(saleItems[i].DEPARTMENT, date).addSaleItem(saleItems[i], date, i);
		}
	}

  saleItems = null;
	return this.saleItems;   
}

weeklyCircular.prototype.createDepartment = function(department, date) {
  if (!this.saleItems[department]) {
    this.saleItems[department] = {};
    this.saleItems[department].info = {
      name: department,
      valid: date,
    };
    this.saleItems[department].items = {};
  }
  
  return this;
}

weeklyCircular.prototype.addSaleItem = function(item, date, itemIndex) {
	var department = item.DEPARTMENT;
  var title = item.TITLE;
  var subtitle = item.SUBTITLE;
  var price = item.PRICE;
  var image = item.IMAGE;
  var description = item.DESCRIPTION;
  var category = item.CATEGORY;
  var validDate = date;
  var product = title + '/' + subtitle + '' + description + '~' + price;
  var saleItem = {
    productID: this.createProductID(product),
    title: title,
    subtitle: subtitle,
    image: image,
    description: description,
    valid: validDate,
    price: price,
    department: department,
    category: category,
    data_id: this.index,
  };

  this.saleItems[department].items[itemIndex] = saleItem;
  
  return this;
}

weeklyCircular.prototype.createProductID = function(product) {
  // Create productID from product info
  var hex = '';
  for (var i = 0; i < product.length; i++) {
    hex += '' + product.charCodeAt(i).toString(16);
  }
  
  return hex;
}
