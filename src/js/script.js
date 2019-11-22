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

      thisProduct.initAccordion();

      console.log('new Product:', thisProduct);
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

    initAccordion(){

      const thisProduct = this;

      /* [done] find the clickable trigger (the element that should react to clicking) */

      const trigger = thisProduct.element.querySelector('.product__header i');

      /* [done] START: click event listener to trigger */

      trigger.addEventListener('click', function(){

        /* [done] prevent default action for event */

        event.preventDefault();

        /* [done] toggle active class on element of thisProduct */

        thisProduct.element.classList.toggle('active');

        /* [done] find all active products */

        const activeProducts = document.querySelectorAll('.product-list article.active');

        console.log('active product is:', activeProducts);

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
  }



  const app = {
    initMenu: function(){
      const thisApp = this;
      console.log('thisApp.data:',thisApp.data);

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
