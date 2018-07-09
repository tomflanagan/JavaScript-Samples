var reach = reach || {};

reach.config = {
  "apiUrl": "http://supera.gofisher.net/manage/reach",
  "couponContainer": "coupons-container",
  "accountContainer": "accountContainer",
  "couponList": "coupons",
  "paths": [{
    "clip": {
      "url": "post/shopper/clip",
      "method": "post",
      "params": ["shopperId", "offerId"],
      "headers": [],
      "callback": "clipCallback",
    },
    "offers": {
      "url": "get/retailer/offers",
      "method": "get",
      "params": [],
      "headers": [],
      "callback": "offersCallback"
    },
    "personalized": {
      "url":"get/shopper/offers/personalized/",
      "method":"get",
      "params":["shopperId"],
      "headers":[],
      "callback": "offersCallback",
    },
    "selected": {
      "url": "get/shopper/offers/selected/",
      "method":"get",
      "params":["shopperId"],
      "headers":[],
      "callback": "offersCallback"
    },
    "redeemed": {
      "url": "get/shopper/offers/redeemed/",
      "method":"get",
      "params":["shopperId"],
      "headers":[],
      "callback": "offersCallback"
    },
    "expired": {
      "url": "get/shopper/offers/expired/",
      "method":"get",
      "params":["shopperId"],
      "headers":[],
      "callback": "offersCallback"

    },
    "available": {
      "url": "get/shopper/offers/available/",
      "method":"get",
      "params":["shopperId"],
      "headers":[],
      "callback": "availableOffersCallback"

    },
    "login": {
      "url": "user/login",
      "method":"post",
      "params":["username", "password"],
      "headers":[],
      "callback": "loginCallback"
    },
    "register": {
      "url": "post/register",
      "method":"post",
      "params":["first_name", "last_name", "email", "password", "phone_number", "address", "city", "state", "postal_code", "birth_date"],// address1
      "headers":[],
      "callback": "registerCallback"
    },
    "shopperDetails": {
      "url": "get/shopper/detail/identifierType/1/identifierValue/",
      "method": "get",
      "params": ["shopperId", "shopper_token"],
      "headers": [],
      "callback": "shopperDetailsCallback"
    },
    "update": {
      "url": "put/shopper/update",
      "method":"post",
      "params":["shopperId", "shopper_token", "first_name", "last_name", "email", "password", "phone_number", "address", "city", "state", "postal_code"],
      "headers":[],
      "callback": "updateCallback"
    },
  }]
}

reach.request = {
  config: reach.config,
  headers: [],
  url:'',
  params: '',
  method: '',
  callback: '',
  xhr: null,
  makeRequest: function(request, obj) {
    try {
      this.headers = reach.config.paths[0][request].headers;
      this.method = reach.config.paths[0][request].method;
      this.callback = reach.config.paths[0][request].callback;
      this.params = reach.config.paths[0][request].params;
      this.url =  reach.config.apiUrl + '/' + reach.config.paths[0][request].url;
      this.obj = obj;
      if (this.method == 'get') {
        return this.getRequest();
      } else {
        return this.postRequest();
      }
    } catch (e) {
      console.log(e);
    }

  },
  getRequest: function() {
    var params = [];
    for (var i = 0; i < this.params.length; i++) {
     params.push(this.obj[this.params[i]]);
    }
    pramString = params.join('/');
    this.url = this.url + pramString;
    this.params = [];
   
    return this;
  },
  postRequest: function() {
    var params = {};
    for (var i = 0; i < this.params.length; i++) {
      params[this.params[i]] = this.obj[this.params[i]];
    }
    this.params = JSON.stringify(params);

    return this;
  },
  sendRequest: function() {
    var self = this;
    try {
      this.xhr = new XMLHttpRequest();
      this.xhr.open(this.method, this.url, true);
      if (this.headers) {
        for (var key in this.headers) {
          this.xhr.setRequestHeader(key, this.headers[key]);
        }
      }
      this.xhr.onreadystatechange = function () {
        if (self.xhr.readyState == 4 && self.xhr.status == "200") {
          try {
            self.obj[self.callback](self.xhr.responseText);
          } catch(e) {
            alert(e);
            console.log(e);
          }
        } else {
          if (self.xhr.readyState == 4) {
            var xhrEvent = new CustomEvent("reachXHRFailure", {
              detail: {
                status: xhr.status,
              }
            });

            document.getElementById(reach.config.couponContainer).dispatchEvent(xhrEvent); 
          } 
        }  
      };
      this.xhr.send(this.params);
    } catch (e) {
      alert(e);
    }
    return this;
  }
   
}

reach.user = {
  shopperId: '',
  shopper_token: '',
  username: '',
  offerId: '',
  couponElement: '',
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  phone_number: '',
  address: '',
  address1: '',
  city: '',
  state: '',
  postal_code: '',
  birth_date: '',

  clip: function(coupon, el) {
    this.offerId = coupon;
    this.couponElement = el;
    this.getShopperId();
    if (!this.getShopperId().shopperId) {
       throw "Please login to clip coupons.";
    }
    reach.request.makeRequest('clip', this).sendRequest();
  },
  getShopperId: function() {
    this.shopperId = '';
    var now = new Date().valueOf();
    if (localStorage.getItem('shopperId')) {
      shopperId = JSON.parse(localStorage.getItem('shopperId'));
      if (localStorage.getItem('shopper_token')) {
        token = localStorage.getItem('shopper_token');
        this.shopper_token = encodeURIComponent(token);
      }
      if (parseInt(now) < parseInt(shopperId.expiration)) {
        this.shopperId = shopperId.id;
        this.saveShopperId(this.shopperId, token);
      } else {
        this.shopperId = '';
      }
    } 

    

    return this;
  },
  clipCallback: function(data) {
    data = JSON.parse(data);
    var clip_status = '';
    if (data.status.status_message) {
      clip_status = data.status.status_message; 
    }

    var clipEvent = new CustomEvent("couponClip", {
      detail: {
        status_message: clip_status,
        element: this.couponElement
      }
    });

    this.offerId = '';

    document.getElementById(reach.config.couponContainer).dispatchEvent(clipEvent);  
  },
  login: function(username, password) {
    this.username = username;
    this.password = password;
    reach.request.makeRequest('login', this).sendRequest();
    
    return this;
  },
  register: function(first_name, last_name, email, password, phone_number, address, city, state, postal_code) {
    this.first_name = first_name;
    this.last_name = last_name;
    this.email = email;
    this.phone_number = phone_number;
    this.password = password;
    this.address = address;
    this.city = city;
    this.state = state;
    this.postal_code = postal_code;
    reach.request.makeRequest('register', this).sendRequest();
    
    return this;

  },
  update: function(first_name, last_name, email, password, phone_number, address, city, state, postal_code) {
    this.first_name = first_name;
    this.last_name = last_name;
    this.email = email;
    this.phone_number = phone_number;
    this.password = password;
    this.address = address;
    this.city = city;
    this.state = state;
    this.postal_code = postal_code;
    reach.request.makeRequest('update', this.getShopperId()).sendRequest();
    
    return this;

  },
  getShopperDetails: function() {
    reach.request.makeRequest('shopperDetails', this.getShopperId()).sendRequest();
  },
  shopperDetailsCallback: function(data) {
    data = JSON.parse(data);

    var shopperInfo = '';
    var error_message = '';
    if (data.result) {
      if (data.result.shopperInfoList) {
        shopperInfo = data.result.shopperInfoList;
      }
      if (data.result.error_message) {
        error_message = data.result.error_message;
      }
    }
    var shopperDetails = new CustomEvent("shopperDetails", {
        detail: {
          shopperInfoList: shopperInfo,
          status_message: data.status_message,
          error_message: error_message
        }
      }   
    );  
    if (document.getElementById(reach.config.accountContainer)) {
      document.getElementById(reach.config.accountContainer).dispatchEvent(shopperDetails);  
    }
    
    data = null;
    shopperDetails = null;
    error_message = null;
    shopperInfo = null;

  },
  loginCallback: function(data) {
    var passwordValid = false;
    data = JSON.parse(data);
    if (data.passwordValid == true) {
      if (data.serviceResponse.result.shopper_id ) {
        passwordValid = true;
        reach.user.shopperId = data.serviceResponse.result.shopper_id;
        reach.user.shopper_token = data.serviceResponse.result.shopper_token;
        this.saveShopperId(data.serviceResponse.result.shopper_id, data.serviceResponse.result.shopper_token);
      }
    }
    var loginEvent = new CustomEvent("userLogin", {
      detail: {
        shopperId: reach.user.getShopperId(),
        passwordValid: passwordValid
      }
    });
     
    document.getElementById(reach.config.couponContainer).dispatchEvent(loginEvent);  
    loginEvent = null;
    passwordValid = null;
    data = null;

  },

  registerCallback: function(data) {
    data = JSON.parse(data);
    if (data.result.shopper_id != null) {
      reach.user.shopperId = data.result.shopper_id;
      reach.user.shopper_token = data.result.shopper_token;
      this.saveShopperId(data.result.shopper_id, data.result.shopper_token);
    } 
    var registerEvent = new CustomEvent("userRegister", {
      detail: {
        shopperId: reach.user.getShopperId().shopperId,
        status_message: data.status_message,
        field_errors: data.result.field_errors,
        error_message: data.result.error_message
      }
    });

    document.getElementById(reach.config.couponContainer).dispatchEvent(registerEvent);  
    data = null;
    registerEvent = null;
  },

  updateCallback: function(data) {
    data = JSON.parse(data);
    var updateEvent = new CustomEvent('accountUpdate', {
      detail: {
        status_message: data.status.status_message,
        field_errors: data.result.field_errors,
        error_message: data.result.error_message
      }
    });
       
    if (document.getElementById(reach.config.accountContainer)) {
      document.getElementById(reach.config.accountContainer).dispatchEvent(updateEvent);  
    } 

    data = null;
    updateEvent = null;  
  },
  saveShopperId: function(shopperId, token) {
    var currentDate = new Date();
    var expiration = new Date(currentDate.valueOf() + (10*60*1000)).valueOf();
    var shopperId = {
      id: shopperId,
      expiration: expiration
    };
    localStorage.setItem('shopperId', JSON.stringify(shopperId));
    localStorage.removeItem('shopper_token');
    localStorage.setItem('shopper_token', token);

    currentDate = null;
    shopperId = null;
    expiration = null;

  }
}

reach.offers = {
  offset:0,
  coupons: {},
  couponList: '',
  clippedCoupons: '',
  categories: '',
  shopperId: '',
  whichCoupons: '',
  getOffers: function(whichType) {
    this.shopperId = reach.user.getShopperId().shopperId;
    if (this.shopperId) {
     return reach.request.makeRequest(whichType, this);
    } else {
     return reach.request.makeRequest('offers', this);
    }

    return this;
  },
  
  offersCallback: function(data) {
    this.categories = null;
    this.coupons = null;
    var template = 'retailerCoupons';
    data = JSON.parse(data);
    if (data.hasOwnProperty('shopperCoupons')) {
      template = 'shopperCoupons';
    }
    this.whichCoupons = template;
    this.coupons = this.convertPriceToDecimal(data, template);
    if (this.coupons[template].length > 0) {
      this.categories = this.getUniqueCategories(this.coupons[template]);
    }

    var offersLoaded = new CustomEvent('offersLoaded', {
      detail: {
        template: this.whichCoupons,
        coupons: this.coupons[template],
        categories: this.categories
      }
    });
    
    document.getElementById(reach.config.couponContainer).dispatchEvent(offersLoaded);  
    
    offersLoaded = null;
    data = null;
    template = null;

    return this;
  },
  getCoupons: function() {
    for (var key in this) {
      console.log(this[key]);
    }
    return this.coupons;
  },
  convertPriceToDecimal: function(coupons, whichone) {
    coupons[whichone].forEach(function (item) {
      if (item.hasOwnProperty('offerValue')) {
        item.offerValue =  (parseInt(item.offerValue) * .01).toFixed(2);
        item.offerValue = (item.offerValue == 0.00) ? 'FREE' : 'Save $' + item.offerValue;
      }
      if (item.hasOwnProperty('value')) {
        item.value =  (parseInt(item.value) * .01).toFixed(2);
        item.value = (item.value == 0.00) ? 'FREE' : 'Save $' + item.value;
      }
      if (item.hasOwnProperty('offerCategory')) {
        item.offerCategory = item.offerCategory.replace(/&/g, "and");
      } else {
        item.category = item.category.replace(/&/g, "and");
      }
    });
    
    return coupons;
  },
  getUniqueCategories: function(coupons) {
    var list = {};
    var categoryProp = coupons[0].hasOwnProperty('category') ? 'category' : 'offerCategory';
    coupons.forEach(function (item) {
      if (list[item[categoryProp]] === undefined) {
        list[item[categoryProp]] = 1;
      } else {
        list[item[categoryProp]] += 1;
      }
    });
    var newItems = [{type:"", amount:"All"}];
    Object.keys(list).forEach(function(key){
      newItems.push({
        type :key,
        amount: key + '(' + list[key] + ")"
      });
    });

    list = null;
    categoryProp = null;

    return newItems;
  }    
}
