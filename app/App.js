import React, { useEffect, useState, useCallback } from "react";
import { hot } from "react-hot-loader/root";
import { HashRouter, Switch, Route } from "react-router-dom";

import HomePage from "./pages/HomePage.js";
// import UserContext from "./contexts/UserContext.js";
// import { axios, store } from "./utils/singleton.js";
// import keys from "./constants/keys.json";

function App() {
  // const [user, setUser] = useState(undefined);
  const [error, setError] = useState(null);

  // const refreshApp = useCallback(async () => {
  //   try {
  //     const vals = store.get(keys.USER);
  //     if (!vals) return;
  //     const { uid } = vals;
  //     if (!uid) return;

  //     const resp = await axios.get("/api/user/me", {
  //       params: {
  //         id: uid
  //       }
  //     });
  //     const curUser = resp.data;
  //     console.log("Current User is", curUser ? curUser.email : curUser);
  //   } catch (err) {
  //     setError(err);
  //   }
  // }, []);

  // //initially refresh app
  // useEffect(() => {
  //   refreshApp();
  // }, [refreshApp]);

  if (error) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <div> {error.message} </div>
      </div>
    );
  } else {
    return (
      // <UserContext.Provider value={{ user, refreshApp }}>
      <HashRouter>
        <Switch>
          <Route path="/" component={HomePage} />
        </Switch>
      </HashRouter>
      // </UserContext.Provider>
    );
  }
}

export default hot(App);
