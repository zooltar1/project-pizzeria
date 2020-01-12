import {templates} from './../settings.js';


class Booking{
  constructor(){
    const thisBooking = this;

    thisBooking.render(app.initBooking);
    thisBooking.initWidgets();

  }

  render(){
    const thisBooking = this;

    const generatedHTML = templates.bookingWidgets();

    thisBooking.dom = {};

    thisBooking.dom.wrapper =



  }

  initWidgets(){
    const thisBooking = this;

  }

}

export default Booking;
