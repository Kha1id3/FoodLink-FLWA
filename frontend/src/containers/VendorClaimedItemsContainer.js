import { connect } from "react-redux";
import VendorClaimedItemsPage from "../components/vendor_claimed_page/VendorClaimedItemsPage";

const mapStateToProps = (state) => {
  return {
    currentUser: state.auth,
  };
};

export default connect(mapStateToProps, null)(VendorClaimedItemsPage);
