import DonatePage from "../components/donate/DonatePage"; // Update path if necessary
import { connect } from "react-redux";
import { fetchUserFoodItems } from "../actions/FoodItemsActions";
import { withRouter } from "react-router-dom";
import { receivedOpenSnackbar } from "../actions/MainSnackbar";

const mapStateToProps = (state) => ({
  currentUser: state.auth,
  fooditems: state.fooditems,
});

const mapDispatchToProps = (dispatch) => ({
  fetchUserFoodItems: (id) => dispatch(fetchUserFoodItems(id)),
  receivedOpenSnackbar: () => dispatch(receivedOpenSnackbar()),
});

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(DonatePage)
);
