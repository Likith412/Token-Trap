import React from "react";

const UserContext = React.createContext({
  user: { _id: "", username: "" },
  setUser: () => {},
});

export default UserContext;
