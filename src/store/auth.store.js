import { ipcService, storageService } from "@/services";
import { AppEventsConstant } from "@/constants";
import router from "@/router";

const state = {
  user: null,
};

const mutations = {
  setUser(state, payload) {
    return (state.user = payload);
  },
};

const actions = {
  addUser(ctx, payload) {
    console.log("addUser action called with payload: ", payload);

    ipcService
      .handleReq(
        `${AppEventsConstant.BASE_URL}${AppEventsConstant.USERS.CREATE}`,
        "POST",
        payload
      )
      .then((res) => {
        console.log("addUser API response: ", res);

        if (res) {
          ctx.commit("setUser", res);
          storageService.set("MIGRATEAUSTRIALIA_USER_INFO", res.data);
          const role = res.data.role; // Assuming role is present in res.data
          console.log("role is", role);
          // Check role and navigate accordingly
          if (role === "Employer") {
            router.push("/dashboard").then(() => {
              console.log("Employer navigation success");
            });
          } else if (role === "Employee") {
            router.push(`/${res.data.id}/jobs/`).then(() => {
              console.log("Employee navigation success");
            });
          }
        }
      })
      .catch((error) => {
        console.error("addUser API error: ", error);
      });
  },
  loginUser(ctx, payload) {
    ipcService
      .handleReq(
        `${AppEventsConstant.BASE_URL}${AppEventsConstant.USERS.LOGIN}`,
        "POST",
        payload
      )
      .then((res) => {
        if (res) {
          ctx.commit("setUser", res);
          storageService.set("MIGRATEAUSTRIALIA_USER_INFO", res);

          const role = res.data.role; // Assuming role is present in res.data

          // Check role and navigate accordingly
          if (role === "Employer") {
            router.push("/dashboard").then(() => {
              console.log("Employer navigation success");
            });
          } else if (role === "Employee") {
            router.push(`/${res?.data?.id}/jobs/`).then(() => {
              console.log("Employee navigation success");
            });
          }
        }
      })
      .catch((error) => {
        console.error("loginUser API error: ", error);
      });
  },
  getCurrentUser(ctx, payload) {
    ctx.commit("setUser", payload);
  },
  logUserOut(ctx) {
    ctx.commit("setUser", null);
    storageService.remove("MIGRATEAUSTRIALIA_USER_INFO");
    storageService.remove("MIGRATEAUSTRIALIA_USER_CART_INFO");
    storageService.remove("MIGRATEAUSTRIALIA_USER_ORDER");
    ctx.commit("displayToast", {
      severity: "success",
      life: 300,
      title: "Success action",
      message: "You are now logged out",
      closable: true,
    });
    router.push("/").then(() => {
      console.log("User logged out navigation success");
    });
  },
};

const getters = {
  getUserState(state) {
    return state.user;
  },
};

export default { state, mutations, actions, getters };
