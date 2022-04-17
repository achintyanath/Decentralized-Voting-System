import React from "react";
import Navbar from "../Navbar/Navigation";

const AdminOnly = (props) => {
  return (
    <React.Fragment>
    <Navbar />
    <div className="container-item attention" style={{ borderColor: "tomato" }}>
      <center>
        <div style={{ margin: "17px" }}>
          <h1>{props.page}</h1>
        </div>
        <p>Admin access only.</p>
      </center>
    </div>
    </React.Fragment>
  );
};

export default AdminOnly;
