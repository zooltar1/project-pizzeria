/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
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

      thisProduct.initAmountWidget();

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
      });

    }

    processOrder(){

      const thisProduct = this;

      /* [done] read all data from the form (using utils.serializeFormToObject) and save it to const formData */

      const formData = utils.serializeFormToObject(thisProduct.form);

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

      /* [done] set the contents of thisProduct.priceElem to be the value of variable price */

      thisProduct.priceElem.innerHTML = price;

    }

    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    }

  }

  class AmountWidget{
    constructor(element){
      const thisWidget = this;

      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions(element);

      console.log('AmountWidget: ', thisWidget);
      console.log('constructor arguments: ', element);
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

      /* TODO: Add validation */

      thisWidget.value = newValue;
      thisWidget.input.value = thisWidget.value;

    }

    initActions(element){
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.addEventListener('change', thisWidget.setValue(thisWidget.input.value));
      //thisWidget.linkDecrease = thisWidget.element.addEventListener('click', thisWidget.setValue(thisWidget.value - 1));
      //thisWidget.linkIncrease = thisWidget.element.addEventListener('click', thisWidget.setValue(thisWidget.value + 1));

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

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
