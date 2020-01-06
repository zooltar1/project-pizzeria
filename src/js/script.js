/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // new code
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // new code
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },

    // new code start

    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: '.cart__total-number',
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong', // przecinek po pierwszym cart__total; oznaczenie strong
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },

    // new code end

  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },

    // new code start

    cart: {
      wrapperActive: 'active',
    },

    // new code end

  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },

    // new code start

    cart: {
      defaultDeliveryFee: 20,
    },

    // new code end

  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),

    // new code start

    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),

    // new code end

  };

  class Product{
    constructor(id, data){
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();

      thisProduct.getElements();

      thisProduct.initAccordion();

      thisProduct.initOrderForm();

      thisProduct.initAmountWidget(thisProduct.amountWidgetElem.addEventListener('updated', function() {
        thisProduct.processOrder();
      }));

      thisProduct.processOrder();

    }

    renderInMenu(){
      const thisProduct = this;

      /* [done] generate HTML based on template */

      const generatedHTML = templates.menuProduct(thisProduct.data);

      /* [done] create element using utils.createElementFromHTML */

      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      /* [done] find menu container */

      const menuContainer = document.querySelector(select.containerOf.menu);

      /* [done] add element to menu */

      menuContainer.appendChild(thisProduct.element);

    }

    getElements(){
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion(){

      const thisProduct = this;

      /* [done] find the clickable trigger (the element that should react to clicking) */

      const trigger = thisProduct.accordionTrigger;

      /* [done] START: click event listener to trigger */

      trigger.addEventListener('click', function(){

        /* [done] prevent default action for event */

        event.preventDefault();

        /* [done] toggle active class on element of thisProduct */

        thisProduct.element.classList.toggle('active');

        /* [done] find all active products */

        const activeProducts = document.querySelectorAll('.product-list article.active');

        /* [done] START LOOP: for each active product */

        for(let activeProduct of activeProducts){

          /* [done] START: if the active product isn't the element of thisProduct */

          if(activeProduct != thisProduct.element){

            /* [done] remove class active for the active product */

            activeProduct.classList.remove('active');

            /* [done] END: if the active product isn't the element of thisProduct */

          }

          /* [done] END LOOP: for each active product */

        }

        /* [DONE] END: click event listener to trigger */

      });

    }

    initOrderForm(){

      const thisProduct = this;

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });

    }

    processOrder(){

      const thisProduct = this;

      /* [done] read all data from the form (using utils.serializeFormToObject) and save it to const formData */

      const formData = utils.serializeFormToObject(thisProduct.form);

      thisProduct.params = {}; // new line

      /* [done] set variable price to equal thisProduct.data.price */

      let price = thisProduct.data.price;

      /* [done] START LOOP: for each paramId in thisProduct.data.params */

      for(let paramId in thisProduct.data.params){

        /* [done] save the element in thisProduct.data.params with key paramId as const param */

        const param = thisProduct.data.params[paramId];

        /* [done] START LOOP: for each optionId in param.options */

        for(let optionId in param.options){

          /* [done] save the element in param.options with key optionId as const option */

          const option = param.options[optionId];

          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;

          /* [done] START IF: if option is selected and option is not default */

          if(optionSelected && !option.default){

            /* [done] add price of option to variable price */

            price = price + option.price;

            /* [done] END IF: if option is selected and option is not default */

          }

          /* [done] START ELSE IF: if option is not selected and option is default */

          else if(!optionSelected && option.default){

            /* [done] deduct price of option from price */

            price = price - option.price;

            /* [done] END ELSE IF: if option is not selected and option is default */

          }

          const optionImages = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);

          if(optionSelected){

            // new code start

            if(!thisProduct.params[paramId]){
              thisProduct.params[paramId] = {
                label: param.label,
                options: {},
              };
            }
            thisProduct.params[paramId].options[optionId] = option.label;

            // new code end

            for(let image of optionImages){

              image.classList.add(classNames.menuProduct.imageVisible);

            }

          }

          else {

            for(let image of optionImages){

              image.classList.remove(classNames.menuProduct.imageVisible);

            }

          }

          /* [done] END LOOP: for each optionId in param.options */

        }

        /* [done] END LOOP: for each paramId in thisProduct.data.params */

      }

      /* multiply price by amount */

      thisProduct.priceSingle = price;
      thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

      /* [done] set the contents of thisProduct.priceElem to be the value of variable price */

      thisProduct.priceElem.innerHTML = thisProduct.price;

      //console.log('thisProduc.params: ', thisProduct.params);

    }

    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    }

    addToCart(){
      const thisProduct = this;

      thisProduct.name = thisProduct.data.name;
      thisProduct.amount = thisProduct.amountWidget.value;

      app.cart.add(thisProduct);
    }

  }

  class AmountWidget{
    constructor(element){
      const thisWidget = this;


      thisWidget.getElements(element);

      thisWidget.value = settings.amountWidget.defaultValue;

      //console.log('thisWidget.value = ', thisWidget.value);

      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions(element);

      //console.log('AmountWidget: ', thisWidget);
      //console.log('constructor arguments: ', element);
    }

    getElements(element){
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value){
      const thisWidget = this;

      const newValue = parseInt(value);

      /* Add validation */


      if(newValue !== thisWidget.value && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax){

        thisWidget.value = newValue;
        thisWidget.announce();

      }

      thisWidget.input.value = thisWidget.value;

    }

    initActions(){
      const thisWidget = this;


      thisWidget.input.addEventListener('change', function() {
        thisWidget.setValue(thisWidget.input.value);
      });

      thisWidget.linkDecrease.addEventListener('click', function(event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });

      thisWidget.linkIncrease.addEventListener('click', function(event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });

      //console.log('thisWidget.input: ', thisWidget.input);
      //console.log('thisWidget.linkDecrease: ', thisWidget.linkDecrease);
      //console.log('thisWidget.linkIncrease: ', thisWidget.linkIncrease);

    }

    announce(){
      const thisWidget = this;

      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }

  }

  class Cart{
    constructor(element){
      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);
      thisCart.initActions();

      // console.log('new Cart', thisCart);
    }

    getElements(element){
      const thisCart = this;

      thisCart.dom = {};

      thisCart.dom.wrapper = element;

      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList); // new code

      // console.log('thisCart.dom.wrapper: ', thisCart.dom.wrapper);

      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger); // new line
    }

    initActions(){
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function(){

        event.preventDefault();

        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);

      });
    }

    add(menuProduct){
      const thisCart = this;

      // new code start

      const generatedHTML = templates.cartProduct(menuProduct);

      //console.log('generatedHTML: ', generatedHTML);


      const generatedDOM = utils.createDOMFromHTML(generatedHTML);

      //console.log('generatedDOM: ', generatedDOM);


      thisCart.dom.productList.appendChild(generatedDOM);

      // new code end

      //console.log('adding product', menuProduct);

      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      console.log('thisCart.products', thisCart.products);

    }
  }

  class CartProduct{
    constructor(menuProduct, element){
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.amount = menuProduct.amount;

      thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));

      thisCartProduct.getElements(element);

      thisCartProduct.initAmountWidget();

      //console.log('new CartProduct: ', thisCartProduct);
      //console.log('productData: ',menuProduct);

    }

    getElements(element){
      const thisCartProduct = this;

      thisCartProduct.dom = {};

      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    }

    initAmountWidget(){
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.wrapper.querySelector(select.cart.toggleTrigger));
      thisCartProduct.AmountWidget.addEventListener('click', function(){
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;

        thisCartProduct.dom.price = thisCartProduct.price;

      });

    }


  }

  const app = {
    initMenu: function(){
      const thisApp = this;

      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function(){
      const thisApp = this;

      thisApp.data = dataSource;
    },

    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    init: function(){
      const thisApp = this;
      //console.log('*** App starting ***');
      //console.log('thisApp:', thisApp);
      //console.log('classNames:', classNames);
      //console.log('settings:', settings);
      //console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };

  app.init();
}
