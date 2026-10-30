import React from "react";
import { connect } from "react-redux";

import VersionsPage from './page.jsx';

class Versions extends React.Component {
  componentDidMount() {
  }
  render() {
    return (
        <div>
            <VersionsPage />
        </div>
    );
  }
}

export default connect(state => {
  return {
    router: state.router
  };
})(Versions);
