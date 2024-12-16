import { connect } from "react-redux";
import MatchedItemsPage from "../components/matched-items/MatchedItemsPage";
import { receivedOpenSnackbar } from "../actions/MainSnackbar.js";

const mapStateToProps = (state) => {
  return {
    currentUser: state.auth, 
  };
};

const mapDispatchToProps = dispatch => {
  return {
    receivedOpenSnackbar: () => dispatch(receivedOpenSnackbar())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MatchedItemsPage);
