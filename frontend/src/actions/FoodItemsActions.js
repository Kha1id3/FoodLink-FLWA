import {RECEIVE_FOOD_ITEMS_BY_VENDOR} from "./ActionTypes.js";
import * as foodItemsApi from "../utils/UtilFoodItems.js"

export const receiveFoodItems = fooditems => {
  return {
    type: RECEIVE_FOOD_ITEMS_BY_VENDOR,
    fooditems: fooditems
  }
}


export const fetchUserFoodItems = (id) => dispatch => {

  return foodItemsApi.getFoodItemsByVendor(id)
    .then(vendor => {
      return dispatch(receiveFoodItems(vendor.data.food_items))
    })
    .catch(err => {
      console.log(err)
    })
}
